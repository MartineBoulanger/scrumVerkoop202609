import { useEffect, useMemo, useRef, useState } from "react";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { createInvoicePdf } from "../lib/pdf";
import { customerName, money } from "../lib/sales";

export default function InvoicePreview({
  invoice,
  onClose,
}: {
  invoice: any;
  onClose: () => void;
}) {
  const document = useMemo(() => createInvoicePdf(invoice), [invoice]);
  const [url, setUrl] = useState("");
  const [renderStatus, setRenderStatus] = useState("PDF laden…");
  const pagesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const next = URL.createObjectURL(document.output("blob"));
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [document]);
  useEffect(() => {
    let active = true;
    let loadingTask: import("pdfjs-dist").PDFDocumentLoadingTask | undefined;
    const container = pagesRef.current;
    container?.replaceChildren();
    setRenderStatus("PDF laden…");
    async function render() {
      try {
        const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
        if (!active) return;
        GlobalWorkerOptions.workerSrc = workerUrl;
        loadingTask = getDocument({
          data: new Uint8Array(document.output("arraybuffer")),
        });
        const pdf = await loadingTask.promise;
        for (let number = 1; number <= pdf.numPages; number++) {
          const page = await pdf.getPage(number);
          if (!active || !container) return;
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = window.document.createElement("canvas");
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          canvas.className = "invoice-page";
          canvas.setAttribute("role", "img");
          canvas.setAttribute(
            "aria-label",
            `Factuur ${invoice.number}, pagina ${number} van ${pdf.numPages}`,
          );
          await page.render({ canvas, viewport }).promise;
          if (!active) return;
          container.append(canvas);
        }
        if (active)
          setRenderStatus(
            `${pdf.numPages} pagina${pdf.numPages === 1 ? "" : "’s"}`,
          );
      } catch (error) {
        if (active)
          setRenderStatus(
            "Het voorbeeld kon niet worden geladen. U kunt de PDF wel downloaden of in een nieuw tabblad openen.",
          );
      }
    }
    void render();
    return () => {
      active = false;
      void loadingTask?.destroy().catch(() => {});
      container?.replaceChildren();
    };
  }, [document, invoice.number]);
  return (
    <section
      className="detail-card invoice-preview"
      aria-label="Factuurvoorbeeld"
    >
      <div className="card-title">
        <h2>Factuur {invoice.number}</h2>
        <button className="action-button" onClick={onClose}>
          Voorbeeld sluiten
        </button>
      </div>
      <p className="page-subtitle">
        {customerName(invoice.customer)} · {invoice.orderNumber} · Totaal{" "}
        {money(invoice.gross)}. Voorbeeld en download gebruiken hetzelfde
        PDF-document.
      </p>
      <div className="module-actions">
        {url && (
          <>
            <a
              className="action-button primary-button"
              href={url}
              download={`factuur-${invoice.number}.pdf`}
            >
              PDF downloaden
            </a>
            <a
              className="action-button"
              href={url}
              target="_blank"
              rel="noreferrer"
            >
              Open PDF in nieuw tabblad
            </a>
          </>
        )}
      </div>
      <p className="page-subtitle" role="status">
        {renderStatus}
      </p>
      <div className="invoice-pages" ref={pagesRef} />
    </section>
  );
}
