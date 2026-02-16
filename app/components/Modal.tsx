import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

const Modal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = false,
}: ModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-300">
            <div 
                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col gap-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-bold text-gradient">{title}</h2>
                    <p className="text-gray-500 text-lg">{description}</p>
                </div>

                <div className="flex flex-row gap-4 mt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 rounded-full border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-6 py-3 rounded-full font-semibold text-white transition-opacity cursor-pointer ${
                            isDestructive 
                                ? 'bg-red-500 hover:bg-red-600' 
                                : 'primary-gradient hover:opacity-90'
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );
};

export default Modal;
