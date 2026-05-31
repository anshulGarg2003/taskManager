import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import {
  FileSearch,
  CheckCircle2,
  PenTool,
  Eraser,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Download,
  RotateCcw,
} from "lucide-react";
import { BASIC_URL } from "../../utlis/API_calls";

const REVIEW_CANVAS_WIDTH = 1100;
const REVIEW_CANVAS_HEIGHT = 1500;

const downloadDataUrl = (dataUrl, fileName) => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function AdminSubmissionsReview() {
  const navigate = useNavigate();
  const userInfo = useSelector((s) => s.user);
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

  const [submissions, setSubmissions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedId, setSelectedId] = useState("");
  const [marks, setMarks] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [editedPageImages, setEditedPageImages] = useState([]);
  const [lineWidth, setLineWidth] = useState(2.5);
  const [isEraser, setIsEraser] = useState(false);

  const selectedSubmission = useMemo(
    () => submissions.find((s) => s._id === selectedId) || null,
    [submissions, selectedId]
  );

  const selectedPages = useMemo(() => {
    if (!selectedSubmission) return [];
    if (Array.isArray(selectedSubmission.answerPageImages) && selectedSubmission.answerPageImages.length > 0) {
      return selectedSubmission.answerPageImages;
    }
    if (selectedSubmission.imageUrl) return [selectedSubmission.imageUrl];
    return [];
  }, [selectedSubmission]);

  const fetchQueue = async () => {
    try {
      const query = new URLSearchParams({ status: statusFilter }).toString();
      const res = await fetch(`${BASIC_URL}/api/submissions/teacher/queue?${query}`);
      const data = await res.json();
      const safe = Array.isArray(data) ? data : [];
      setSubmissions(safe);
      setSelectedId((curr) => curr || safe[0]?._id || "");
    } catch {
      setSubmissions([]);
    }
  };

  const loadCanvasFromDataUrl = (dataUrl) => {
    const canvas = canvasRef.current;
    if (!canvas || !dataUrl) return;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, REVIEW_CANVAS_WIDTH, REVIEW_CANVAS_HEIGHT);
      ctx.drawImage(img, 0, 0, REVIEW_CANVAS_WIDTH, REVIEW_CANVAS_HEIGHT);
    };
    img.src = dataUrl;
  };

  const syncCurrentCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || selectedPages.length === 0) return;
    const updatedPage = canvas.toDataURL("image/png", 1.0);
    setEditedPageImages((prev) => {
      const next = [...prev];
      next[currentPage] = updatedPage;
      return next;
    });
  };

  const getRelativePoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDrawing = (event) => {
    drawingRef.current = true;
    lastPointRef.current = getRelativePoint(event);
  };

  const draw = (event) => {
    if (!drawingRef.current) return;
    event.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const point = getRelativePoint(event);
    const last = lastPointRef.current;

    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    ctx.strokeStyle = isEraser ? "rgba(0,0,0,1)" : "#ef4444";
    ctx.lineWidth = isEraser ? lineWidth * 6 : lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    lastPointRef.current = point;
  };

  const stopDrawing = () => {
    drawingRef.current = false;
    syncCurrentCanvas();
  };

  const clearAnnotationsOnPage = () => {
    if (!selectedPages.length) return;
    const source = selectedPages[currentPage];
    setEditedPageImages((prev) => {
      const next = [...prev];
      next[currentPage] = source;
      return next;
    });
    loadCanvasFromDataUrl(source);
  };

  const openPage = (index) => {
    if (index < 0 || index >= selectedPages.length) return;
    syncCurrentCanvas();
    setCurrentPage(index);
  };

  const buildReviewedPdf = () => {
    const canvas = canvasRef.current;
    if (!canvas || selectedPages.length === 0) return "";

    const pages = [...editedPageImages];
    pages[currentPage] = canvas.toDataURL("image/png", 1.0);

    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pages.forEach((pageData, idx) => {
      if (idx > 0) pdf.addPage();
      pdf.setFontSize(11);
      pdf.text(`Reviewed Page ${idx + 1}/${pages.length}`, 10, 10);
      pdf.addImage(pageData, "PNG", 5, 16, pageWidth - 10, pageHeight - 21, undefined, "FAST");
    });

    return pdf.output("datauristring");
  };

  useEffect(() => {
    fetchQueue();
  }, [statusFilter]);

  useEffect(() => {
    if (!selectedSubmission) return;

    setMarks(selectedSubmission.marks ?? "");
    setTotalMarks(selectedSubmission.totalMarks ?? "");
    setFeedback(selectedSubmission.feedback ?? "");
    setCurrentPage(0);

    const initialPages =
      Array.isArray(selectedSubmission.answerPageImages) && selectedSubmission.answerPageImages.length > 0
        ? selectedSubmission.answerPageImages
        : selectedSubmission.imageUrl
          ? [selectedSubmission.imageUrl]
          : [];

    setEditedPageImages(initialPages);
  }, [selectedSubmission]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = REVIEW_CANVAS_WIDTH;
    canvas.height = REVIEW_CANVAS_HEIGHT;
  }, []);

  useEffect(() => {
    if (!selectedPages.length) return;
    const source = editedPageImages[currentPage] || selectedPages[currentPage];
    if (source) loadCanvasFromDataUrl(source);
  }, [currentPage, editedPageImages, selectedPages]);

  const reviewSubmission = async () => {
    if (!selectedSubmission) return;
    if (!marks || !totalMarks) {
      toast.error("Please enter marks and total marks");
      return;
    }

    try {
      setSaving(true);
      const reviewedPdfDataUrl = buildReviewedPdf();

      const res = await fetch(
        `${BASIC_URL}/api/submissions/${selectedSubmission._id}/review`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "reviewed",
            marks: Number(marks),
            totalMarks: Number(totalMarks),
            feedback,
            reviewedBy: userInfo.id,
            reviewedPdfDataUrl,
          }),
        }
      );

      if (!res.ok) throw new Error();

      toast.success("Submission reviewed");
      await fetchQueue();
    } catch {
      toast.error("Failed to save review");
    } finally {
      setSaving(false);
    }
  };

  if (userInfo.role !== "admin" && userInfo.role !== "teacher") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-slate-700 font-semibold">Only teachers/admin can access submission review.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] p-4 md:p-8 bg-[radial-gradient(circle_at_12%_10%,rgba(14,165,233,0.20),transparent_30%),radial-gradient(circle_at_88%_20%,rgba(249,115,22,0.20),transparent_30%),linear-gradient(130deg,#f8fafc,#fefce8)]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-xl">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-2xl font-black text-slate-900 inline-flex items-center gap-2">
              <FileSearch className="w-6 h-6 text-sky-600" /> Review PDFs
            </h2>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 bg-white mb-3"
          >
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="all">All</option>
          </select>

          <div className="space-y-2 max-h-[58vh] overflow-auto pr-1">
            {submissions.map((s) => (
              <button
                key={s._id}
                onClick={() => setSelectedId(s._id)}
                className={`w-full text-left rounded-xl border p-3 ${selectedId === s._id ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-white"}`}
              >
                <p className="font-semibold text-slate-900">{s.userId?.name || "Student"}</p>
                <p className="text-xs text-slate-500">{s.subject} • {s.chapter || "General"}</p>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{s.questionText || "No question text"}</p>
              </button>
            ))}
            {submissions.length === 0 && (
              <p className="text-sm text-slate-500">No submissions in this filter.</p>
            )}
          </div>

          {selectedSubmission && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
              <h3 className="font-bold text-slate-900">Mark Submission</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsEraser(false)}
                  className={`px-3 py-2 rounded-lg border text-sm font-semibold inline-flex items-center justify-center gap-1 ${!isEraser ? "bg-sky-600 text-white border-sky-600" : "bg-white border-slate-300 text-slate-700"}`}
                >
                  <PenTool className="w-4 h-4" /> Pen
                </button>
                <button
                  onClick={() => setIsEraser(true)}
                  className={`px-3 py-2 rounded-lg border text-sm font-semibold inline-flex items-center justify-center gap-1 ${isEraser ? "bg-rose-600 text-white border-rose-600" : "bg-white border-slate-300 text-slate-700"}`}
                >
                  <Eraser className="w-4 h-4" /> Eraser
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLineWidth((w) => Math.max(1, w - 0.5))}
                  className="p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold text-slate-700">Stroke: {lineWidth.toFixed(1)}</span>
                <button
                  onClick={() => setLineWidth((w) => Math.min(8, w + 0.5))}
                  className="p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={clearAnnotationsOnPage}
                  className="ml-auto px-2.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Page
                </button>
              </div>

              {!!selectedSubmission.reviewedPdfDataUrl && (
                <button
                  onClick={() => downloadDataUrl(selectedSubmission.reviewedPdfDataUrl, `reviewed-${selectedSubmission._id}.pdf`)}
                  className="w-full px-3 py-2 rounded-xl bg-indigo-600 text-white font-semibold inline-flex items-center justify-center gap-1"
                >
                  <Download className="w-4 h-4" /> Download Current Reviewed PDF
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Marks"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="p-2 rounded-lg border border-slate-300 bg-white"
                />
                <input
                  type="number"
                  placeholder="Total"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  className="p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <textarea
                rows={3}
                placeholder="Teacher feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white"
              />
              <button
                onClick={reviewSubmission}
                disabled={saving}
                className="w-full px-3 py-2 rounded-xl bg-emerald-600 text-white font-semibold inline-flex items-center justify-center gap-1 disabled:opacity-60"
              >
                <CheckCircle2 className="w-4 h-4" /> {saving ? "Saving..." : "Save Review"}
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-xl">
          {selectedPages.length > 0 ? (
            <>
              <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-2 flex items-center justify-between gap-2">
                <button
                  onClick={() => openPage(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="p-2 rounded-lg border border-slate-300 bg-white disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <p className="text-sm font-bold text-slate-700">Page {currentPage + 1} / {selectedPages.length}</p>
                <button
                  onClick={() => openPage(currentPage + 1)}
                  disabled={currentPage === selectedPages.length - 1}
                  className="p-2 rounded-lg border border-slate-300 bg-white disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-auto max-h-[78vh]">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto touch-none"
                  onPointerDown={startDrawing}
                  onPointerMove={draw}
                  onPointerUp={stopDrawing}
                  onPointerLeave={stopDrawing}
                />
              </div>
            </>
          ) : selectedSubmission?.answerPdfDataUrl ? (
            <iframe
              title="Answer PDF"
              src={selectedSubmission.answerPdfDataUrl}
              className="w-full h-[78vh] rounded-2xl border border-slate-200 bg-white"
            />
          ) : selectedSubmission?.imageUrl ? (
            <div className="h-[78vh] flex items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <img src={selectedSubmission.imageUrl} alt="Answer" className="max-h-full max-w-full object-contain" />
            </div>
          ) : (
            <div className="h-[78vh] flex items-center justify-center rounded-2xl border border-dashed border-slate-300 text-slate-500">
              Select a submission to preview.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
