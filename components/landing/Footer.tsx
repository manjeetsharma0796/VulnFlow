import { Github, Twitter, MessageSquare } from "lucide-react";

export function LandingFooter() {
  const sections = [
    { title: "Project", links: ["Docs", "Roadmap", "Changelog"] },
    { title: "Developers", links: ["API", "Contracts", "Examples"] },
    { title: "Legal", links: ["Privacy", "Terms", "Cookies"] },
  ];
  return (
    <footer className="mt-24 border-t">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-lg font-semibold">VulnFlow</div>
            <p className="text-sm text-muted-foreground mt-2">AI-assisted smart contract security on Flow EVM Testnet.</p>
            <div className="flex gap-3 mt-4 text-muted-foreground">
              <a href="#" aria-label="GitHub"><Github className="w-5 h-5" /></a>
              <a href="#" aria-label="Twitter"><Twitter className="w-5 h-5" /></a>
              <a href="#" aria-label="Discord"><MessageSquare className="w-5 h-5" /></a>
            </div>
          </div>
          {sections.map((s, i) => (
            <div key={i}>
              <div className="text-sm font-medium mb-3">{s.title}</div>
              <ul className="space-y-2">
                {s.links.map((l, j) => (
                  <li key={j}><a className="text-sm text-muted-foreground hover:underline" href="#">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground mt-8">© {new Date().getFullYear()} VulnFlow. All rights reserved.</div>
      </div>
    </footer>
  );
}
