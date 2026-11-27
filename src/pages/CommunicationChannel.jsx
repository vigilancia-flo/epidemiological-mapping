import React, { useState, useEffect, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import Sidebar from "@/components/Sidebar";
import SidebarPrivate from "@/components/private/SidebarPrivate.jsx";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Megaphone,
  Send,
  Plus,
  Loader2,
  Menu,
  UserCircle,
  CheckCircle2,
  X,
  Image as ImageIcon,
  Trash2,
  ZoomIn,
  Search,
  Clock,
  AlertCircle,
  MessageCircle,
  Sparkles,
  Radio,
  Rss,
  Eye,
} from "lucide-react";
import WhatsappSvg from "../assets/svg/whatsapp-svgrepo-com.svg";

/* ============================== SKELETON ============================== */

const PostSkeleton = () => (
  <div className="relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
    <div className="relative h-48 bg-slate-100 overflow-hidden">
      <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/70 to-transparent animate-shimmer" />
    </div>
    <div className="p-6 md:p-8 space-y-4">
      <div className="flex justify-between">
        <div className="h-6 w-32 bg-slate-100 rounded-full relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/70 to-transparent animate-shimmer" />
        </div>
        <div className="h-6 w-24 bg-slate-100 rounded-full relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/70 to-transparent animate-shimmer" />
        </div>
      </div>
      <div className="h-7 w-3/4 bg-slate-100 rounded-lg relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/70 to-transparent animate-shimmer" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-slate-100 rounded relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/70 to-transparent animate-shimmer" />
        </div>
        <div className="h-4 w-5/6 bg-slate-100 rounded relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/70 to-transparent animate-shimmer" />
        </div>
      </div>
      <div className="pt-5 border-t border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-100" />
        <div className="space-y-1.5">
          <div className="h-3 w-24 bg-slate-100 rounded" />
          <div className="h-3 w-32 bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  </div>
);

/* ============================== TOAST ============================== */

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const Icon = type === "success" ? CheckCircle2 : AlertCircle;
  const isSuccess = type === "success";

  return (
    <div
      role="status"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-xl animate-toast-in ${
        isSuccess
          ? "bg-emerald-50/95 border-emerald-300/70 text-emerald-800 shadow-emerald-500/30"
          : "bg-rose-50/95 border-rose-300/70 text-rose-800 shadow-rose-500/30"
      }`}
    >
      <span
        className={`flex size-8 items-center justify-center rounded-full ${
          isSuccess ? "bg-emerald-500/15" : "bg-rose-500/15"
        }`}
      >
        <Icon className="w-5 h-5 shrink-0" />
      </span>
      <span className="text-sm font-semibold">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
        aria-label="Fechar notificação"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

/* ============================== CONFIRM DIALOG ============================== */

const ConfirmDialog = ({
  title,
  description,
  onConfirm,
  onCancel,
  isLoading,
}) => (
  <div
    role="alertdialog"
    aria-modal="true"
    className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    onClick={onCancel}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200 border border-slate-200 overflow-hidden"
    >
      {/* Top accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-rose-400 via-rose-500 to-rose-400" />

      {/* Glow */}
      <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 size-40 rounded-full bg-rose-500/15 blur-3xl" />

      <div className="relative w-14 h-14 rounded-full bg-linear-to-br from-rose-100 to-rose-200 flex items-center justify-center mb-4 mx-auto ring-4 ring-rose-50 animate-badge-pop">
        <AlertCircle className="w-7 h-7 text-rose-500" />
      </div>
      <h3 className="relative text-lg font-bold text-slate-800 text-center">
        {title}
      </h3>
      <p className="relative text-sm text-slate-500 text-center mt-2">
        {description}
      </p>
      <div className="relative flex gap-3 mt-6">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="group/del relative overflow-hidden flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white bg-linear-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 transition-all shadow-lg shadow-rose-500/30 disabled:opacity-50 cursor-pointer"
        >
          <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover/del:translate-x-full" />
          {isLoading ? (
            <Loader2 className="relative w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="relative w-4 h-4" />
          )}
          <span className="relative">Excluir</span>
        </button>
      </div>
    </div>
  </div>
);

/* ============================== MAIN ============================== */

export default function CommunicationChannel({ isPrivateView = false }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Excluir
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Lightbox
  const [expandedImage, setExpandedImage] = useState(null);

  // Imagens com erro
  const [brokenImages, setBrokenImages] = useState({});

  const fileInputRef = useRef(null);
  const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const baseUrl = rawBaseUrl.replace(/\/$/, "");

  const TITLE_MAX = 120;
  const CONTENT_MAX = 2000;

  /* ---------- Auth ---------- */
  const checkIsAdmin = () => {
    try {
      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("access_token");
      if (!token) return false;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return (
        payload.role === "ADMIN" ||
        payload.role === "admin" ||
        payload.is_superuser === true
      );
    } catch {
      return false;
    }
  };

  /* ---------- Fetch ---------- */
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("access_token") || localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(`${baseUrl}/api/canal_comunicacao/`, {
        headers,
      });
      if (!response.ok) throw new Error("Erro ao buscar dados");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Erro ao buscar avisos:", error);
      setToast({
        type: "error",
        message: "Não foi possível carregar os avisos.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsAdmin(checkIsAdmin());
    fetchPosts();
  }, []);

  /* ---------- Trava scroll + ESC ---------- */
  useEffect(() => {
    const anyOpen = isModalOpen || expandedImage || deleteTarget;
    document.body.style.overflow = anyOpen ? "hidden" : "";

    const onKey = (e) => {
      if (e.key === "Escape") {
        if (expandedImage) setExpandedImage(null);
        else if (deleteTarget) setDeleteTarget(null);
        else if (isModalOpen) setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isModalOpen, expandedImage, deleteTarget]);

  /* ---------- Upload ---------- */
  const processImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setToast({ type: "error", message: "Envie apenas arquivos de imagem." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({ type: "error", message: "A imagem deve ter no máximo 5MB." });
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageChange = (e) => processImageFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processImageFile(e.dataTransfer.files?.[0]);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ---------- Criar ---------- */
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsSubmitting(true);
    try {
      const token =
        localStorage.getItem("access_token") || localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", newTitle.trim());
      formData.append("content", newContent.trim());
      if (imageFile) formData.append("image", imageFile);

      const response = await fetch(`${baseUrl}/api/canal_comunicacao/`, {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      });

      if (response.ok) {
        setNewTitle("");
        setNewContent("");
        clearImage();
        setIsModalOpen(false);
        setToast({ type: "success", message: "Aviso publicado com sucesso!" });
        fetchPosts();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(
          "Erro detalhado do backend:",
          errorData,
          "Status HTTP:",
          response.status,
        );
        throw new Error(`Erro no servidor (Status: ${response.status})`);
      }
    } catch (error) {
      console.error("Erro ao criar aviso:", error);
      setToast({ type: "error", message: "Falha ao publicar o aviso." });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- Excluir ---------- */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const token =
        localStorage.getItem("access_token") || localStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}/api/canal_comunicacao/${deleteTarget.id}/`,
        {
          method: "DELETE",
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        },
      );
      if (!response.ok) throw new Error();
      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setToast({ type: "success", message: "Aviso removido." });
      setDeleteTarget(null);
    } catch {
      setToast({ type: "error", message: "Não foi possível excluir o aviso." });
    } finally {
      setIsDeleting(false);
    }
  };

  /* ---------- Datas ---------- */
  const parseDate = (date, time) => {
    if (!date || !time) return null;
    try {
      const timeClean = time.split(".")[0];
      return new Date(`${date}T${timeClean}`);
    } catch {
      return null;
    }
  };

  const formatarDataAbsoluta = (date, time) => {
    const d = parseDate(date, time);
    if (!d) return "";
    return format(d, "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatarDataRelativa = (date, time) => {
    const d = parseDate(date, time);
    if (!d) return "";
    try {
      return formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
    } catch {
      return "";
    }
  };

  const tempoLeitura = (text = "") => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  /* ---------- Filtro ---------- */
  const filteredPosts = posts.filter((p) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      p.title?.toLowerCase().includes(q) ||
      p.content?.toLowerCase().includes(q) ||
      p.author?.toLowerCase().includes(q)
    );
  });

  /* ---------- Render ---------- */
  return (
    <div className="relative flex h-screen w-full bg-slate-50 overflow-hidden text-slate-800">
      <Helmet>
        <title>Canal de Comunicação - Novidades</title>
        <meta
          name="description"
          content="Acompanhe os avisos oficiais e atualizações da equipe de Vigilância Epidemiológica."
        />
      </Helmet>

      {isPrivateView ? (
        <SidebarPrivate
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      ) : (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="relative flex-1 flex flex-col h-full w-full overflow-y-auto overflow-x-hidden ml-0 md:ml-[var(--sidebar-width,16rem)] transition-all duration-300">
        {/* ==================== BACKGROUND ==================== */}
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,#054060_1px,transparent_1px),linear-gradient(to_bottom,#054060_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none fixed -left-40 top-40 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl animate-float-slow"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none fixed -right-40 bottom-0 h-96 w-96 rounded-full bg-[#054060]/8 blur-3xl animate-float-slow"
          style={{ animationDelay: "2s" }}
          aria-hidden="true"
        />

        {/* ==================== HEADER ==================== */}
        <header className="px-3 sm:px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-30 bg-gradient-to-br from-[#4180ab] to-[#054060] backdrop-blur-md shadow-sm border-b border-white/10">
          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden shrink-0 group p-2 text-white bg-white/10 rounded-xl hover:bg-white/20 border border-transparent hover:border-white/10 transition-all cursor-pointer"
              aria-label="Abrir menu"
            >
              <Menu className="size-5 sm:size-6 group-hover:scale-110 transition-transform" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <Megaphone className="size-5 md:size-6 text-white shrink-0" />
              <h2 className="text-sm sm:text-base md:text-xl font-bold tracking-wide text-white truncate">
                Canal de Comunicação
              </h2>
            </div>
          </div>
        </header>

        {/* ==================== CONTEÚDO ==================== */}
        <main className="relative p-4 md:p-8 space-y-6 w-full max-w-4xl mx-auto overflow-x-hidden animate-in fade-in duration-500 pb-24">
          {/* ============ HERO ============ */}
          <section className="group/hero relative overflow-hidden rounded-3xl border border-white/80 bg-linear-to-br from-white via-blue-50/50 to-slate-50 shadow-[0_10px_40px_-15px_rgba(5,64,96,0.25)] backdrop-blur-md p-6 md:p-8 transition-shadow duration-500 hover:shadow-[0_25px_60px_-20px_rgba(5,64,96,0.35)]">
            {/* Animated top accent */}
            <div
              className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[#4180ab] via-[#0a7ea3] to-[#4180ab] bg-[length:200%_auto] animate-gradient-x"
              aria-hidden="true"
            />

            {/* Corner blobs */}
            <div
              className="pointer-events-none absolute -top-20 -right-20 size-56 rounded-full bg-[#4180ab]/15 blur-3xl animate-glow-pulse"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-20 -left-20 size-56 rounded-full bg-sky-400/10 blur-3xl"
              aria-hidden="true"
            />

            {/* Rotating conic ring behind icon */}
            <div
              className="pointer-events-none absolute right-6 top-6 size-32 rounded-full bg-[conic-gradient(from_0deg,rgba(5,64,96,0.15),transparent_50%,rgba(10,126,163,0.2),transparent)] animate-spin-slow blur-md opacity-60"
              aria-hidden="true"
            />

            <div className="relative flex items-start gap-3 mb-2">
              <div className="relative p-2.5 rounded-xl bg-linear-to-br from-[#4180ab]/20 to-[#0a7ea3]/10 text-[#4180ab] shrink-0 ring-1 ring-inset ring-[#4180ab]/20 shadow-sm transition-transform duration-500 group-hover/hero:scale-110 group-hover/hero:rotate-6">
                <Sparkles className="w-5 h-5" />
                <span className="absolute -right-1 -top-1 size-2 rounded-full bg-amber-400 animate-pulse ring-2 ring-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black bg-linear-to-r from-[#054060] via-[#0a7ea3] to-[#054060] bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-x">
                  Novidades
                </h1>
                <p className="text-slate-500 mt-1 text-sm md:text-base">
                  Acompanhe os avisos oficiais e atualizações da equipe de
                  Vigilância Epidemiológica.
                </p>
              </div>
            </div>

            <div className="relative flex flex-wrap items-center gap-3 mt-5">
              {/* WhatsApp button */}
              <a
                href="https://whatsapp.com/channel/0029Vb9PV8gDeON9oUd0uF2o"
                target="_blank"
                rel="noopener noreferrer"
                className="group/wa relative inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-linear-to-r from-[#25D366] via-[#1DA851] to-[#25D366] bg-[length:200%_auto] hover:bg-[position:right_center] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#25D366]/30 hover:shadow-xl hover:shadow-[#25D366]/40 transition-all duration-500 hover:-translate-y-0.5 overflow-hidden"
              >
                <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 group-hover/wa:translate-x-full" />
                <span className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
                <img
                  src={WhatsappSvg}
                  alt=""
                  className="relative w-5 h-5 transition-transform group-hover/wa:scale-110"
                />
                <span className="relative">Entrar no Canal</span>
              </a>

              {posts.length > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#054060] bg-white border border-[#4180ab]/20 px-3 py-2 rounded-xl shadow-sm">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#4180ab] opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-[#4180ab]" />
                  </span>
                  {posts.length} {posts.length === 1 ? "aviso" : "avisos"}{" "}
                  publicados
                </span>
              )}

              {isAdmin && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  Modo Admin
                </span>
              )}
            </div>
          </section>

          {/* ============ BUSCA ============ */}
          {posts.length > 0 && (
            <div className="group/search relative">
              <div
                className="absolute -inset-0.5 rounded-2xl bg-linear-to-r from-[#4180ab] via-[#0a7ea3] to-[#4180ab] bg-[length:200%_auto] opacity-0 blur transition-opacity duration-500 group-focus-within/search:opacity-60 animate-gradient-x"
                aria-hidden="true"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none transition-colors group-focus-within/search:text-[#4180ab]" />
              <input
                type="search"
                placeholder="Buscar avisos por título, conteúdo ou autor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="relative w-full bg-white border border-slate-200 rounded-xl pl-11 pr-10 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4180ab]/30 focus:border-[#4180ab] transition-all shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-500 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                  aria-label="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* ============ LISTA ============ */}
          {loading ? (
            <div className="grid gap-6">
              <PostSkeleton />
              <PostSkeleton />
            </div>
          ) : posts.length === 0 ? (
            <div className="relative overflow-hidden text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-300 shadow-sm">
              <div
                className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 size-56 rounded-full bg-slate-100/70 blur-3xl"
                aria-hidden="true"
              />
              <div className="relative w-20 h-20 mx-auto mb-4 rounded-full bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center ring-4 ring-white shadow-inner animate-glow-pulse">
                <Megaphone className="w-9 h-9 text-slate-400" />
              </div>
              <h3 className="relative text-lg font-bold text-slate-700">
                Nenhum aviso publicado
              </h3>
              <p className="relative text-slate-500 text-sm mt-1 max-w-sm mx-auto px-4">
                Assim que novos avisos oficiais forem publicados, eles
                aparecerão aqui.
              </p>
              {isAdmin && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="group/first relative inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-linear-to-r from-[#4180ab] to-[#054060] hover:from-[#054060] hover:to-[#0a7ea3] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#4180ab]/30 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
                >
                  <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover/first:translate-x-full" />
                  <Plus className="relative w-4 h-4 group-hover/first:rotate-90 transition-transform" />
                  <span className="relative">Criar primeiro aviso</span>
                </button>
              )}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="relative overflow-hidden text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-300 shadow-sm">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center ring-4 ring-white shadow-inner">
                <Search className="w-9 h-9 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">
                Nenhum resultado encontrado
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                Tente ajustar os termos de busca.
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="mt-5 text-sm font-bold text-[#4180ab] hover:text-[#054060] underline-offset-4 hover:underline cursor-pointer"
              >
                Limpar busca
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredPosts.map((post, index) => (
                <article
                  key={post.id}
                  style={{ animationDelay: `${Math.min(index * 80, 400)}ms` }}
                  className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_4px_20px_-10px_rgba(5,64,96,0.15)] hover:shadow-[0_20px_50px_-15px_rgba(5,64,96,0.3)] hover:border-[#4180ab]/40 transition-all duration-500 flex flex-col hover:-translate-y-1 animate-post-in"
                >
                  {/* Left accent bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-[#4180ab] via-[#0a7ea3] to-[#054060] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Corner glow */}
                  <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-[#4180ab]/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Shine sweep */}
                  <div className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/30 to-transparent transition-transform duration-[1500ms] group-hover:translate-x-full z-10" />

                  {/* IMAGEM */}
                  {post.image && !brokenImages[post.id] && (
                    <div
                      onClick={() => setExpandedImage(post.image)}
                      className="relative w-full max-h-[500px] bg-slate-900/5 flex items-center justify-center border-b border-slate-100 overflow-hidden cursor-zoom-in group/image"
                    >
                      <img
                        src={post.image}
                        alt={post.title}
                        onError={() =>
                          setBrokenImages((prev) => ({
                            ...prev,
                            [post.id]: true,
                          }))
                        }
                        className="w-full h-auto max-h-[500px] object-contain transition-transform duration-700 group-hover/image:scale-[1.05]"
                        loading="lazy"
                      />

                      {/* Overlay gradient always subtle */}
                      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-900/20 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-500" />

                      <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md text-white text-xs font-semibold px-3 py-2 rounded-full opacity-0 group-hover/image:opacity-100 transition-all duration-300 scale-90 group-hover/image:scale-100 ring-1 ring-white/20">
                          <ZoomIn className="w-4 h-4" />
                          Clique para ampliar
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="relative p-6 md:p-8 flex flex-col flex-1">
                    {/* META */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div className="relative inline-flex items-center gap-2 bg-linear-to-r from-blue-50 to-sky-50 px-3 py-1 rounded-full border border-blue-200/60 shadow-sm">
                        <span className="relative flex size-2">
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#4180ab] opacity-75" />
                          <span className="relative inline-flex size-2 rounded-full bg-[#4180ab]" />
                        </span>
                        <span className="text-[10px] font-bold text-[#054060] uppercase tracking-wider">
                          Aviso Oficial
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <time
                          className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors group-hover:bg-slate-200/70 group-hover:text-slate-700"
                          title={formatarDataAbsoluta(post.date, post.time)}
                        >
                          <Clock className="w-3 h-3" />
                          {formatarDataRelativa(post.date, post.time)}
                        </time>
                        <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                          <Eye className="w-3 h-3" />
                          {tempoLeitura(post.content)} min
                        </span>
                      </div>
                    </div>

                    {/* CONTEÚDO */}
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-3 break-words transition-colors duration-300 group-hover:text-[#054060]">
                      {post.title}
                    </h2>
                    <div className="text-slate-600 leading-relaxed whitespace-pre-wrap break-words flex-1">
                      {post.content}
                    </div>

                    {/* RODAPÉ */}
                    <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-10 h-10 rounded-full bg-linear-to-br from-[#4180ab] to-[#054060] flex items-center justify-center text-white font-bold shadow-md shadow-[#4180ab]/30 shrink-0 ring-2 ring-white">
                          {post.author ? (
                            post.author.charAt(0).toUpperCase()
                          ) : (
                            <UserCircle className="w-5 h-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">
                            {post.author || "Administração"}
                          </p>
                          <p className="text-xs text-slate-500 font-medium truncate flex items-center gap-1">
                            <Rss className="w-3 h-3 text-[#4180ab]" />
                            Equipe de Comunicação
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <CheckCircle2
                          className="w-5 h-5 text-emerald-500 drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]"
                          aria-label="Mensagem verificada"
                        />
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteTarget(post)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer hover:scale-110"
                            aria-label="Excluir aviso"
                            title="Excluir aviso"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ==================== FAB ==================== */}
      {isAdmin && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="group fixed bottom-8 right-8 z-40 cursor-pointer"
          title="Criar novo aviso"
          aria-label="Criar novo aviso"
        >
          {/* Ping rings */}
          <span className="absolute inset-0 rounded-full bg-[#4180ab] opacity-40 animate-ping" />
          <span
            className="absolute inset-0 rounded-full bg-[#4180ab] opacity-20 animate-ping"
            style={{ animationDelay: "0.6s" }}
          />

          <span className="relative flex items-center justify-center bg-linear-to-br from-[#4180ab] via-[#0a7ea3] to-[#054060] hover:from-[#054060] hover:to-[#0a7ea3] text-white p-4 rounded-full shadow-xl shadow-[#4180ab]/40 transition-all duration-300 group-hover:scale-110 ring-4 ring-white/40">
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </span>

          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-slate-800/95 backdrop-blur text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg">
            Novo aviso
          </span>
        </button>
      )}

      {/* ==================== MODAL CRIAR ==================== */}
      {isAdmin && isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Novo comunicado"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => !isSubmitting && setIsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-slate-200"
          >
            {/* Top animated accent */}
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[#4180ab] via-[#0a7ea3] to-[#4180ab] bg-[length:200%_auto] animate-gradient-x z-10" />

            {/* Header */}
            <div className="relative flex items-center justify-between p-5 border-b border-slate-100 bg-linear-to-r from-slate-50 to-blue-50/50 shrink-0">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-[#4180ab] to-[#054060] text-white shadow-md shadow-[#4180ab]/30">
                  <Megaphone className="w-4 h-4" />
                </span>
                Novo Comunicado
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                aria-label="Fechar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreatePost}
              className="p-5 md:p-6 space-y-5 overflow-y-auto"
            >
              {/* Título */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-slate-700">
                    Título do Aviso
                  </label>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      newTitle.length > TITLE_MAX
                        ? "text-rose-600 bg-rose-50"
                        : "text-slate-500 bg-slate-100"
                    }`}
                  >
                    {newTitle.length}/{TITLE_MAX}
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Ex: Atualização no Calendário Vacinal"
                  maxLength={TITLE_MAX}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4180ab]/50 focus:border-[#4180ab] focus:bg-white transition-all"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              {/* Conteúdo */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-slate-700">
                    Conteúdo
                  </label>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      newContent.length > CONTENT_MAX
                        ? "text-rose-600 bg-rose-50"
                        : "text-slate-500 bg-slate-100"
                    }`}
                  >
                    {newContent.length}/{CONTENT_MAX}
                  </span>
                </div>
                <textarea
                  placeholder="Escreva os detalhes do aviso aqui..."
                  maxLength={CONTENT_MAX}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-[#4180ab]/50 focus:border-[#4180ab] focus:bg-white transition-all"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                />
              </div>

              {/* Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Imagem de Capa{" "}
                  <span className="font-normal text-slate-400">(Opcional)</span>
                </label>

                {!imagePreview ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`group/drop relative w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer overflow-hidden ${
                      isDragging
                        ? "border-[#4180ab] bg-blue-50 text-[#4180ab] scale-[1.02] shadow-lg shadow-[#4180ab]/20"
                        : "border-slate-300 hover:border-[#4180ab] bg-slate-50 hover:bg-blue-50/50 text-slate-500 hover:text-[#4180ab]"
                    }`}
                  >
                    <div className="relative flex size-12 items-center justify-center rounded-full bg-white ring-2 ring-inset ring-slate-200/80 shadow-sm transition-transform group-hover/drop:scale-110 group-hover/drop:rotate-3">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-semibold">
                      {isDragging
                        ? "Solte a imagem aqui"
                        : "Clique ou arraste uma imagem"}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      JPG, PNG ou WEBP · máx. 5MB
                    </span>
                  </button>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 group/prev bg-slate-100 flex items-center justify-center max-h-48">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-auto max-h-48 object-contain"
                    />
                    <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover/prev:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <button
                        type="button"
                        onClick={clearImage}
                        className="bg-rose-500 hover:bg-rose-600 text-white p-2.5 rounded-full transition-all cursor-pointer shadow-lg hover:scale-110 ring-2 ring-white/50"
                        title="Remover imagem"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Footer */}
              <div className="pt-5 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting || !newTitle.trim() || !newContent.trim()
                  }
                  className="group/pub relative flex items-center gap-2 bg-linear-to-r from-[#4180ab] to-[#054060] hover:from-[#054060] hover:to-[#0a7ea3] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-[#4180ab]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer overflow-hidden"
                >
                  <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover/pub:translate-x-full" />
                  {isSubmitting ? (
                    <>
                      <Loader2 className="relative w-5 h-5 animate-spin" />
                      <span className="relative">Publicando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="relative w-4 h-4 group-hover/pub:translate-x-0.5 group-hover/pub:-translate-y-0.5 transition-transform" />
                      <span className="relative">Publicar Aviso</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== CONFIRMAR EXCLUSÃO ==================== */}
      {deleteTarget && (
        <ConfirmDialog
          title="Excluir aviso?"
          description={`"${deleteTarget.title}" será removido permanentemente. Essa ação não pode ser desfeita.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isLoading={isDeleting}
        />
      )}

      {/* ==================== LIGHTBOX ==================== */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-md animate-in fade-in duration-200 cursor-zoom-out"
          onClick={() => setExpandedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Imagem ampliada"
        >
          <button
            onClick={() => setExpandedImage(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/25 p-2.5 rounded-full transition-all duration-200 z-10 ring-1 ring-white/20 hover:ring-white/40 hover:scale-110 cursor-pointer"
            aria-label="Fechar imagem"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={expandedImage}
            alt="Imagem expandida"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ==================== TOAST ==================== */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ==================== KEYFRAMES ==================== */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes gradient-x {
              0%, 100% { background-position: 0% 50%; }
              50%      { background-position: 100% 50%; }
            }
            @keyframes glow-pulse {
              0%, 100% { opacity: 0.5; transform: scale(0.95); }
              50%      { opacity: 1;   transform: scale(1.08); }
            }
            @keyframes float-slow {
              0%, 100% { transform: translate(0, 0) scale(1); }
              50%      { transform: translate(16px, -20px) scale(1.05); }
            }
            @keyframes spin-slow {
              from { transform: rotate(0deg); }
              to   { transform: rotate(360deg); }
            }
            @keyframes shimmer {
              0%   { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            @keyframes badge-pop {
              0%   { transform: scale(0) rotate(-45deg); opacity: 0; }
              60%  { transform: scale(1.15) rotate(5deg); opacity: 1; }
              100% { transform: scale(1) rotate(0deg); opacity: 1; }
            }
            @keyframes post-in {
              0%   { opacity: 0; transform: translateY(12px) scale(0.98); }
              100% { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes toast-in {
              0%   { opacity: 0; transform: translate(-50%, 20px) scale(0.95); }
              60%  { opacity: 1; transform: translate(-50%, -2px) scale(1.02); }
              100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
            }

            .animate-gradient-x  { animation: gradient-x 8s ease infinite; }
            .animate-glow-pulse  { animation: glow-pulse 3.5s ease-in-out infinite; }
            .animate-float-slow  { animation: float-slow 10s ease-in-out infinite; }
            .animate-spin-slow   { animation: spin-slow 20s linear infinite; }
            .animate-shimmer     { animation: shimmer 1.8s ease-in-out infinite; }
            .animate-badge-pop   { animation: badge-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
            .animate-post-in     { animation: post-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
            .animate-toast-in    { animation: toast-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both; }

            @media (prefers-reduced-motion: reduce) {
              .animate-gradient-x,
              .animate-glow-pulse,
              .animate-float-slow,
              .animate-spin-slow,
              .animate-shimmer,
              .animate-badge-pop,
              .animate-post-in,
              .animate-toast-in {
                animation: none !important;
              }
            }
          `,
        }}
      />
    </div>
  );
}
