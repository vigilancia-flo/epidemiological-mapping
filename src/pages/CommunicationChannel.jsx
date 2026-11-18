import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import Sidebar from "@/components/Sidebar";
import SidebarPrivate from "@/components/private/SidebarPrivate.jsx";
import { format } from "date-fns";
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
  MessageCircle,
} from "lucide-react";
import WhatsappSvg from "../assets/svg/whatsapp-svgrepo-com.svg";

export default function CommunicationChannel({ isPrivateView = false }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Estados do Modal e Formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔥 Novo estado para a imagem expandida
  const [expandedImage, setExpandedImage] = useState(null);

  const fileInputRef = useRef(null);
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Verifica se é Admin
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsAdmin(checkIsAdmin());
    fetchPosts();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    setIsSubmitting(true);
    try {
      const token =
        localStorage.getItem("access_token") || localStorage.getItem("token");

      const formData = new FormData();
      formData.append("title", newTitle);
      formData.append("content", newContent);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch(`${baseUrl}/api/canal_comunicacao/`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (response.ok) {
        setNewTitle("");
        setNewContent("");
        clearImage();
        setIsModalOpen(false);
        fetchPosts();
      } else {
        console.error("Erro no servidor:", await response.text());
      }
    } catch (error) {
      console.error("Erro ao criar aviso:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatarData = (date, time) => {
    if (!date || !time) return "";
    try {
      const dataLimpa = time.split(".")[0];
      return format(
        new Date(`${date}T${dataLimpa}`),
        "dd 'de' MMMM, yyyy 'às' HH:mm",
        { locale: ptBR },
      );
    } catch {
      return `${date} ${time}`;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-800 relative">
      <Helmet>
        <title>Canal de Comunicação - Novidades</title>
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

      <div className="flex-1 flex flex-col h-full w-full overflow-y-auto overflow-x-hidden ml-0 md:ml-[var(--sidebar-width,16rem)] transition-all duration-300">
        {/* HEADER PADRÃO DO SISTEMA */}
        <header className="px-3 sm:px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-30 bg-gradient-to-br from-[#4180ab] to-[#054060] backdrop-blur-md shadow-sm border-b border-white/10 transition-all duration-300">
          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden shrink-0 group p-2 text-white bg-white/10 rounded-xl hover:bg-white/20 border border-transparent hover:border-white/10 transition-all duration-300 cursor-pointer"
              aria-label="Abrir menu"
            >
              <Menu className="size-5 sm:size-6 group-hover:scale-110 transition-transform duration-200" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <Megaphone className="size-5 md:size-6 text-white shrink-0" />
              <h2 className="text-sm sm:text-base md:text-xl font-bold tracking-wide text-white truncate">
                Canal de Comunicação
              </h2>
            </div>
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="p-4 md:p-8 space-y-6 w-full max-w-4xl mx-auto overflow-x-hidden animate-in fade-in duration-500 pb-24">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800">Novidades</h1>
            <p className="text-slate-500 mt-1">
              Acompanhe os avisos oficiais e atualizações da equipe de
              Vigilância Epidemiológica.
            </p>
            <a
              href="https://chat.whatsapp.com/GdTG5slUt5SJGspYQm18OT"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 mt-5 px-6 py-2.5 bg-[#25D366] hover:bg-[#1DA851] text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              <img src={WhatsappSvg} alt="" className="w-5 h-5" />
              Entrar no Canal de Comunicação
            </a>
          </div>

          {/* LISTA DE AVISOS */}
          {loading ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <Loader2 className="w-8 h-8 text-[#4180ab] animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">
                Nenhum aviso publicado até o momento.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col group"
                >
                  {/* 🔥 IMAGEM CLICÁVEL */}
                  {post.image && (
                    <div
                      onClick={() => setExpandedImage(post.image)}
                      className="relative w-full max-h-[500px] bg-slate-900/5 flex items-center justify-center border-b border-slate-100 overflow-hidden cursor-zoom-in group/image"
                    >
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-auto max-h-[500px] object-contain transition-transform duration-500 group-hover/image:scale-[1.02]"
                        loading="lazy"
                      />
                      {/* Overlay escuro sutil que aparece no hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                        <ZoomIn className="w-10 h-10 text-white opacity-0 group-hover/image:opacity-100 drop-shadow-lg transition-all duration-300 scale-50 group-hover/image:scale-100" />
                      </div>
                    </div>
                  )}

                  <div className="p-6 md:p-8 flex flex-col flex-1">
                    {/* Topo do Card */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                        <span className="w-2 h-2 rounded-full bg-[#4180ab]"></span>
                        <span className="text-xs font-bold text-[#054060] uppercase tracking-wider">
                          Aviso Oficial
                        </span>
                      </div>
                      <time className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
                        {formatarData(post.date, post.time)}
                      </time>
                    </div>

                    {/* Conteúdo */}
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-3 break-words">
                      {post.title}
                    </h2>
                    <div className="text-slate-600 leading-relaxed whitespace-pre-wrap break-words flex-1">
                      {post.content}
                    </div>

                    {/* Rodapé (Autor) */}
                    <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#4180ab]/10 flex items-center justify-center border border-[#4180ab]/20 text-[#4180ab] font-bold shadow-sm">
                          {post.author ? (
                            post.author.charAt(0).toUpperCase()
                          ) : (
                            <UserCircle className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {post.author || "Administração"}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">
                            Equipe de Comunicação
                          </p>
                        </div>
                      </div>
                      <CheckCircle2
                        className="w-5 h-5 text-emerald-500"
                        title="Mensagem Verificada"
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* BOTÃO FLUTUANTE (FAB) - Apenas Admin */}
      {isAdmin && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 bg-[#4180ab] hover:bg-[#054060] text-white p-4 rounded-full shadow-lg shadow-[#4180ab]/40 transition-all duration-300 hover:scale-110 z-40 cursor-pointer flex items-center justify-center group"
          title="Criar novo aviso"
        >
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      )}

      {/* MODAL DE CRIAÇÃO - Apenas Admin */}
      {isAdmin && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#4180ab]" /> Novo Comunicado
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário (Scrollable) */}
            <form
              onSubmit={handleCreatePost}
              className="p-5 md:p-6 space-y-5 overflow-y-auto"
            >
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Título do Aviso
                </label>
                <input
                  type="text"
                  placeholder="Ex: Atualização no Calendário Vacinal"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4180ab]/50 focus:border-[#4180ab] transition-all"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Conteúdo
                </label>
                <textarea
                  placeholder="Escreva os detalhes do aviso aqui..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-[#4180ab]/50 focus:border-[#4180ab] transition-all"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                />
              </div>

              {/* Upload de Imagem */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Imagem de Capa (Opcional)
                </label>

                {!imagePreview ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-300 hover:border-[#4180ab] bg-slate-50 hover:bg-blue-50/50 rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer text-slate-500 hover:text-[#4180ab]"
                  >
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-sm font-semibold">
                      Clique para anexar uma imagem
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      JPG, PNG ou WEBP
                    </span>
                  </button>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 group bg-slate-100 flex items-center justify-center max-h-48">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-auto max-h-48 object-contain"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={clearImage}
                        className="bg-rose-500 hover:bg-rose-600 text-white p-2.5 rounded-full transition-colors cursor-pointer shadow-lg hover:scale-105"
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

              <div className="pt-5 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-[#4180ab] hover:bg-[#054060] text-white px-6 py-2.5 rounded-xl font-bold shadow-md shadow-[#4180ab]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Publicar Aviso
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔥 LIGHTBOX (VISUALIZADOR DE IMAGEM EXPANDIDA) */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-sm animate-in fade-in duration-200 cursor-zoom-out"
          onClick={() => setExpandedImage(null)}
        >
          {/* Botão de fechar */}
          <button
            onClick={() => setExpandedImage(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all duration-200 z-10"
            title="Fechar imagem"
          >
            <X className="w-6 h-6" />
          </button>

          <img
            src={expandedImage}
            alt="Imagem expandida"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
