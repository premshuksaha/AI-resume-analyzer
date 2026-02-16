import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import { resumes } from "constants/index";
import ResumeCard from "~/components/ResumeCard";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AI Resume Analyzer" },
    { name: "description", content: "Smart AI-powered resume analysis tool" },
  ];
}

export default function Home() {
  const { auth } = usePuterStore();
  const navigate = useNavigate();

  useEffect(() => {
      if(auth.isAuthenticated) navigate('/auth?next=/');
  }, [auth.isAuthenticated])

  return <main>
    <Navbar />
     <section className="main-section">
        <div className="page-heading">
          <h1>Track Your Applications & Resume Ratings</h1>
          <h2>Get insights into your job applications and resume performance with our AI-powered analysis tool.</h2>
        </div>
        {resumes.length > 0 && (
        <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
        </div>
        )}
    </section>
  </main>
}
