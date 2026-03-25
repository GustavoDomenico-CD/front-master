import PainelLogin from "./painel-login/page";
import ChatManager from "./shared/Chatbot";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <PainelLogin />
      <ChatManager />
    </div>
  );
}
