import {Link} from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";
import Modal from "./Modal";

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath, resumePath }, onDelete }: { resume: Resume, onDelete: (id: string) => void }) => {
    const { fs, kv } = usePuterStore();
    const [resumeUrl, setResumeUrl] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const loadResume = async () => {
            const blob = await fs.read(imagePath);
            if(!blob) return;
            let url = URL.createObjectURL(blob);
            setResumeUrl(url);
        }

        loadResume();
    }, [imagePath]);

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsModalOpen(true);
    }

    const handleConfirmDelete = async () => {
        setIsModalOpen(false);
        setIsDeleting(true);
        try {
            // delete from kv using store's fixed deleteKV (which calls puter.kv.del)
            await kv.delete(`resume:${id}`);
            // delete files if they exist
            if (resumePath) {
                try {
                    await fs.delete(resumePath);
                } catch (fErr) {
                    console.warn('Failed to delete resume file:', fErr);
                }
            }
            if (imagePath) {
                try {
                    await fs.delete(imagePath);
                } catch (fErr) {
                    console.warn('Failed to delete image file:', fErr);
                }
            }

            onDelete(id);
        } catch (error) {
            alert(`Failed to delete resume data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div className="relative group">
            <Link to={`/resume/${id}`} className={`resume-card animate-in fade-in duration-1000 ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="resume-card-header">
                    <div className="flex flex-col gap-2">
                        {companyName && <h2 className="text-black! font-bold wrap-break-word">{companyName}</h2>}
                        {jobTitle && <h3 className="text-lg wrap-break-word text-gray-500">{jobTitle}</h3>}
                        {!companyName && !jobTitle && <h2 className="text-black! font-bold">Resume</h2>}
                    </div>
                    <div className="shrink-0">
                        <ScoreCircle score={feedback.overallScore} />
                    </div>
                </div>
                {resumeUrl && (
                    <div className="gradient-border animate-in fade-in duration-1000">
                        <div className="w-full h-full">
                            <img
                                src={resumeUrl}
                                alt="resume"
                                className="w-full h-87.5 max-sm:h-50 object-cover object-top"
                            />
                        </div>
                    </div>
                )}
            </Link>

            <button 
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="absolute top-4 right-4 p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-sm cursor-pointer"
                title="Delete Resume"
            >
                <img src="/icons/cross.svg" alt="delete" className="w-4 h-4" />
            </button>

            <Modal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Resume"
                description={`Are you sure you want to delete your resume for ${companyName || 'this position'}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Keep it"
                isDestructive={true}
            />
        </div>
    )
}
export default ResumeCard