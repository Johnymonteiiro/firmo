export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold">
          Bem-vindo ao Sistema de Controle de Contratos!
        </h1>
        <a
          href="/dashboard"
          className="bg-primary text-primary-foreground font-bold py-2 px-4 rounded"
        >
          Acessar o sistema
        </a>
      </div>
    </main>
  );
}
