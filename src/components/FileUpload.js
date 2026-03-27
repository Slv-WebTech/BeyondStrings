import { parseWhatsAppFileInChunks } from '../utils/parser';
import { motion } from 'framer-motion';
import { UploadCloud } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { FilePicker } from './ui/file-picker';

function FileUpload({ onParsed, onParseChunk, onParseProgress, onParseStart, onError, fileName, isParsing, onParsingChange }) {
    const handleFileSelect = async (file) => {
        if (!file) {
            return;
        }

        const extension = file.name.split('.').pop()?.toLowerCase();
        if (!['txt', 'doc'].includes(extension || '')) {
            onError('Please upload a .txt or .doc file.');
            return;
        }

        try {
            onParseStart?.(file.name);
            onParsingChange?.(true);
            const result = await parseWhatsAppFileInChunks(file, {
                chunkSize: 1200,
                onChunk: onParseChunk,
                onProgress: ({ percent }) => onParseProgress?.(percent)
            });
            onParsed(result, file.name);
        } catch (error) {
            onError('Could not parse this file. Please check the export format.');
        } finally {
            onParsingChange?.(false);
        }
    };

    return (
        <Card className="ambient-ring overflow-hidden premium-panel">
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em] text-[var(--text-main)]">Upload Chat</h2>
                        <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                            Supported: WhatsApp exported .txt or .doc files.
                        </p>
                    </div>
                    <span className="premium-chip">
                        <UploadCloud size={13} />
                        Import
                    </span>
                </div>

                <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-[1.4rem] border border-dashed border-[var(--border-soft)] bg-[var(--panel-soft)] px-4 py-8 text-center transition hover:border-emerald-400/60 hover:bg-[var(--accent-soft)]"
                >
                    <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[var(--accent)] shadow-inner">
                        <UploadCloud size={22} />
                    </span>
                    <span className="text-sm font-semibold tracking-[-0.01em] text-[var(--text-main)]">
                        {isParsing ? 'Parsing chat export...' : 'Choose chat file'}
                    </span>
                    <span className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
                        Upload your export and the viewer will parse participants, messages, and timestamps.
                    </span>

                    <FilePicker
                        className="mt-4 w-full max-w-sm"
                        accept=".txt,.doc"
                        placeholder={fileName || 'No file selected'}
                        buttonLabel="Browse"
                        onFileSelect={handleFileSelect}
                    />
                </motion.div>

                {fileName ? (
                    <div className="mt-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--input-bg)] px-3 py-3 text-xs font-medium text-[var(--text-main)]">
                        Loaded: <span className="text-[var(--accent)]">{fileName}</span>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}

export default FileUpload;
