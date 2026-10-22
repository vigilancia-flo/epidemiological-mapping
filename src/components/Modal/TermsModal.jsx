import React from "react";
import { X, ReceiptText } from "lucide-react";

export default function TermsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-[#054060] text-white rounded-t-3xl">
          <div className="flex items-center gap-3">
            <ReceiptText className="size-6" />
            <h2 className="text-xl font-bold text-white">Termos de Uso</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 overflow-y-auto flex-1 text-sm text-slate-600 space-y-4 custom-scrollbar">
          <p>
            Bem-vindo ao <span className="font-bold">SIGEP</span>. Ao aceitar e
            utilizar a nossa plataforma, concorda com os seguintes termos e
            condições:
          </p>

          <h3 className="font-bold text-slate-800 text-base">
            1. Aceitação dos Termos
          </h3>
          <p>
            O uso deste sistema está condicionado à aceitação e ao cumprimento
            destes Termos de Uso. Se não concorda com qualquer parte destes
            termos, não deve utilizar a plataforma.
          </p>

          <h3 className="font-bold text-slate-800 text-base">
            2. Uso Responsável
          </h3>
          <p>
            O acesso à área do profissional é estritamente pessoal e
            intransferível. O utilizador compromete-se a manter a
            confidencialidade das suas credenciais de acesso e a não partilhar
            dados sensíveis de pacientes ou do sistema com terceiros não
            autorizados.
          </p>

          <h3 className="font-bold text-slate-800 text-base">
            3. Propriedade Intelectual
          </h3>
          <p>
            Todo o conteúdo, design, código-fonte e logotipos presentes nesta
            plataforma são de propriedade exclusiva e protegidos pelas leis de
            direitos de autor.
          </p>

          <h3 className="font-bold text-slate-800 text-base">
            4. Limitação de Responsabilidade
          </h3>
          <p>
            As informações fornecidas pelo sistema têm caráter de apoio à
            decisão. A responsabilidade por diagnósticos e ações em saúde
            permanece inteiramente com os profissionais qualificados.
          </p>

          <h3 className="font-bold text-slate-800 text-base">
            5. Alterações aos Termos
          </h3>
          <p>
            Reservamo-nos o direito de modificar estes termos a qualquer
            momento. Alterações significativas serão comunicadas através da
            própria plataforma.
          </p>
        </div>

        {/* Rodapé */}
        <div className="p-5 border-t border-slate-100 flex justify-end bg-slate-50/50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#054060] text-white font-semibold rounded-xl hover:bg-[#085883] transition-colors cursor-pointer hover:cursor-pointer"
          >
            Compreendi e Aceito
          </button>
        </div>
      </div>
    </div>
  );
}
