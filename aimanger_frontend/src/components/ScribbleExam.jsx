import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useSelector } from "react-redux";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";
import {
  PenTool,
  Eraser,
  RotateCcw,
  Save,
  FileText,
  Minus,
  Plus,
  CopyPlus,
  CopyMinus,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { BASIC_URL } from "../utlis/API_calls";

const CANVAS_WIDTH = 1100;
const CANVAS_HEIGHT = 1500;

const drawSheetTemplate = (ctx) => {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = "#f1f5f9";
  ctx.fillRect(0, 0, CANVAS_WIDTH, 110);
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 28px Arial";
  ctx.fillText("Student Answer Sheet", 30, 52);
  ctx.font = "20px Arial";
  ctx.fillText("Use stylus/mouse to write your solution", 30, 84);

  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  for (let y = 140; y < CANVAS_HEIGHT; y += 42) {
    ctx.beginPath();
    ctx.moveTo(18, y);
    ctx.lineTo(CANVAS_WIDTH - 18, y);
    ctx.stroke();
  }
};

const makeTemplateDataUrl = () => {
  const offscreen = document.createElement("canvas");
  offscreen.width = CANVAS_WIDTH;
  offscreen.height = CANVAS_HEIGHT;
  const ctx = offscreen.getContext("2d");
  drawSheetTemplate(ctx);
  return offscreen.toDataURL("image/png", 1.0);
};

const downloadDataUrl = (dataUrl, fileName) => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function ScribbleExam() {
  const { isAuthenticated } = useAuth0();
  const userInfo = useSelector((s) => s.user);

  const canvasRef = useRef(null);
  const templateRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

  const [questions, setQuestions] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [lineWidth, setLineWidth] = useState(2.5);
  const [isEraser, setIsEraser] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageImages, setPageImages] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const initialTemplate = makeTemplateDataUrl();
    templateRef.current = initialTemplate;
    setPageImages([initialTemplate]);
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    };
    img.src = initialTemplate;
  }, []);

  const loadPageToCanvas = (dataUrl) => {
    const canvas = canvasRef.current;
    if (!canvas || !dataUrl) return;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    };
    img.src = dataUrl;
  };

  useEffect(() => {
    if (!pageImages.length) return;
    loadPageToCanvas(pageImages[pageIndex]);
  }, [pageIndex, pageImages]);

  const syncCurrentCanvasToPageState = () => {
    const canvas = canvasRef.current;
    if (!canvas || !pageImages.length) return;
    const currentDataUrl = canvas.toDataURL("image/png", 1.0);
    setPageImages((prev) => {
      const next = [...prev];
      next[pageIndex] = currentDataUrl;
      return next;
    });
  };

  useEffect(() => {
    fetch(`${BASIC_URL}/api/questions`)
      .then((r) => r.json())
      .then((data) => setQuestions(Array.isArray(data) ? data : []))
      .catch(() => setQuestions([]));
  }, []);

  const fetchMySubmissions = async () => {
    if (!userInfo?.id) return;
    try {
      const res = await fetch(`${BASIC_URL}/api/submissions/student/${userInfo.id}`);
      const data = await res.json();
      setMySubmissions(Array.isArray(data) ? data : []);
    } catch {
      setMySubmissions([]);
    }
  };

  useEffect(() => {
    fetchMySubmissions();
  }, [userInfo?.id]);

  const filteredQuestions = useMemo(() => {
    if (!subjectFilter) return questions;
    return questions.filter((q) => q.subject === subjectFilter);
  }, [questions, subjectFilter]);

  const selectedQuestion = useMemo(() => {
    return filteredQuestions.find((q) => q._id === selectedQuestionId) || null;
  }, [filteredQuestions, selectedQuestionId]);

  const getRelativePoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = event.clientX ?? event.touches?.[0]?.clientX ?? 0;
    const clientY = event.clientY ?? event.touches?.[0]?.clientY ?? 0;

    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDrawing = (event) => {
    drawingRef.current = true;
    lastPointRef.current = getRelativePoint(event);
  };

  const stopDrawing = () => {
    drawingRef.current = false;
    syncCurrentCanvasToPageState();
  };

  const draw = (event) => {
    if (!drawingRef.current) return;
    event.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const point = getRelativePoint(event);
    const last = lastPointRef.current;

    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    ctx.strokeStyle = isEraser ? "rgba(0,0,0,1)" : "#111827";
    ctx.lineWidth = isEraser ? lineWidth * 5 : lineWidth;

    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    lastPointRef.current = point;
  };

  const clearSheet = () => {
    const template = templateRef.current || makeTemplateDataUrl();
    templateRef.current = template;
    setPageImages((prev) => {
      const next = [...prev];
      next[pageIndex] = template;
      return next;
    });
    loadPageToCanvas(template);
  };

  const goToPage = (nextIndex) => {
    if (nextIndex < 0 || nextIndex >= pageImages.length) return;
    syncCurrentCanvasToPageState();
    setPageIndex(nextIndex);
  };

  const addPage = () => {
    syncCurrentCanvasToPageState();
    const template = templateRef.current || makeTemplateDataUrl();
    templateRef.current = template;
    setPageImages((prev) => [...prev, template]);
    setPageIndex(pageImages.length);
  };

  const removeCurrentPage = () => {
    if (pageImages.length <= 1) {
      toast.error("At least one page is required");
      return;
    }

    setPageImages((prev) => {
      const next = prev.filter((_, idx) => idx !== pageIndex);
      return next;
    });

    setPageIndex((curr) => Math.max(0, curr - 1));
  };

  const buildSubmissionBundle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return { pageData: [], answerPdfDataUrl: "" };

    const currentDataUrl = canvas.toDataURL("image/png", 1.0);
    const pages = [...pageImages];
    pages[pageIndex] = currentDataUrl;

    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pages.forEach((imageData, idx) => {
      if (idx > 0) pdf.addPage();
      pdf.setFontSize(11);
      pdf.text(`Answer Page ${idx + 1}/${pages.length}`, 10, 10);
      pdf.addImage(imageData, "PNG", 5, 16, pageWidth - 10, pageHeight - 21, undefined, "FAST");
    });

    return {
      pageData: pages,
      answerPdfDataUrl: pdf.output("datauristring"),
    };
  };

  const saveSubmission = async () => {
    if (!isAuthenticated || !userInfo?.id) {
      toast.error("Please login first");
      return;
    }

    if (!selectedQuestion) {
      toast.error("Please select a question before submission");
      return;
    }

    try {
      setSaving(true);

      const { pageData, answerPdfDataUrl } = buildSubmissionBundle();

      const payload = {
        userId: userInfo.id,
        subject: selectedQuestion.subject || "General",
        chapter: selectedQuestion.chapter || "",
        questionId: selectedQuestion._id,
        questionTitle: `${selectedQuestion.subject || "Question"} - ${selectedQuestion.chapter || ""}`,
        questionText: selectedQuestion.question,
        answerPdfDataUrl,
        answerPageImages: pageData,
        pageCount: pageData.length,
        examType: "written-exam",
      };

      const res = await fetch(`${BASIC_URL}/api/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save submission");
      }

      toast.success("Answer sheet saved and submitted as PDF");
      await fetchMySubmissions();
    } catch (err) {
      toast.error(err.message || "Submission failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] p-4 md:p-8 bg-[radial-gradient(circle_at_16%_10%,rgba(14,165,233,0.20),transparent_30%),radial-gradient(circle_at_84%_20%,rgba(249,115,22,0.20),transparent_28%),linear-gradient(135deg,#eff6ff,#fefce8)]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-xl">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-sky-600" /> Write Exam
          </h2>
          <p className="text-sm text-slate-600 mt-1">Select question paper and answer by scribbling with stylus/mouse.</p>

          <div className="mt-4 space-y-3">
            <select
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value);
                setSelectedQuestionId("");
              }}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
            >
              <option value="">All Subjects</option>
              {[...new Set(questions.map((q) => q.subject).filter(Boolean))].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={selectedQuestionId}
              onChange={(e) => setSelectedQuestionId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
            >
              <option value="">Select Question</option>
              {filteredQuestions.map((q) => (
                <option key={q._id} value={q._id}>
                  {(q.chapter ? `${q.chapter} - ` : "") + (q.question || "Question")}
                </option>
              ))}
            </select>
          </div>

          {selectedQuestion && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Question</p>
              <p className="text-sm text-slate-800">{selectedQuestion.question}</p>
            </div>
          )}

          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 flex items-center justify-between gap-2">
              <button
                onClick={() => goToPage(pageIndex - 1)}
                disabled={pageIndex === 0}
                className="p-2 rounded-lg border border-slate-300 bg-white disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <p className="text-sm font-bold text-slate-700">Page {pageIndex + 1} / {pageImages.length}</p>
              <button
                onClick={() => goToPage(pageIndex + 1)}
                disabled={pageIndex === pageImages.length - 1}
                className="p-2 rounded-lg border border-slate-300 bg-white disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={addPage}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold inline-flex items-center justify-center gap-1"
              >
                <CopyPlus className="w-4 h-4" /> Add Page
              </button>
              <button
                onClick={removeCurrentPage}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold inline-flex items-center justify-center gap-1"
              >
                <CopyMinus className="w-4 h-4" /> Remove Page
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEraser(false)}
                className={`px-3 py-2 rounded-xl border text-sm font-semibold inline-flex items-center gap-1 ${!isEraser ? "bg-sky-600 text-white border-sky-600" : "bg-white text-slate-700 border-slate-300"}`}
              >
                <PenTool className="w-4 h-4" /> Pen
              </button>
              <button
                onClick={() => setIsEraser(true)}
                className={`px-3 py-2 rounded-xl border text-sm font-semibold inline-flex items-center gap-1 ${isEraser ? "bg-rose-600 text-white border-rose-600" : "bg-white text-slate-700 border-slate-300"}`}
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
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              onClick={clearSheet}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold inline-flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-4 h-4" /> Clear
            </button>
            <button
              onClick={saveSubmission}
              disabled={saving}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-semibold inline-flex items-center justify-center gap-1 disabled:opacity-60"
            >
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Submit PDF"}
            </button>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <h3 className="font-bold text-slate-900">Reviewed Copies</h3>
            <p className="text-xs text-slate-500 mt-0.5">Download teacher-reviewed annotated PDFs once available.</p>
            <div className="mt-2 space-y-2 max-h-48 overflow-auto pr-1">
              {mySubmissions.slice(0, 8).map((sub) => (
                <div key={sub._id} className="rounded-lg border border-slate-200 bg-white p-2">
                  <p className="text-xs font-semibold text-slate-700 line-clamp-1">{sub.questionTitle || sub.subject}</p>
                  <p className="text-[11px] text-slate-500">Status: {sub.status}</p>
                  {!!sub.reviewedPdfDataUrl && (
                    <button
                      onClick={() => downloadDataUrl(sub.reviewedPdfDataUrl, `reviewed-${sub._id}.pdf`)}
                      className="mt-1 text-xs px-2 py-1 rounded-md bg-emerald-600 text-white inline-flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Reviewed PDF
                    </button>
                  )}
                  {!sub.reviewedPdfDataUrl && !!sub.answerPdfDataUrl && (
                    <button
                      onClick={() => downloadDataUrl(sub.answerPdfDataUrl, `submitted-${sub._id}.pdf`)}
                      className="mt-1 text-xs px-2 py-1 rounded-md bg-sky-600 text-white inline-flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Submitted PDF
                    </button>
                  )}
                </div>
              ))}
              {mySubmissions.length === 0 && (
                <p className="text-xs text-slate-500">No submissions yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white/85 p-4 shadow-xl">
          <div
            className="w-full bg-white rounded-2xl border border-slate-300 overflow-auto max-h-[82vh]"
          >
            <canvas
              ref={canvasRef}
              className="w-full h-auto touch-none"
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerLeave={stopDrawing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
