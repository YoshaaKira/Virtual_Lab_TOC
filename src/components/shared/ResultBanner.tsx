import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ResultBannerProps {
  accepted: boolean | null;
  message?: string;
}

export default function ResultBanner({ accepted, message }: ResultBannerProps) {
  if (accepted === null) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border font-semibold text-lg ${
        accepted
          ? 'bg-green-900/40 border-green-500 text-green-300'
          : 'bg-red-900/40 border-red-500 text-red-300'
      }`}
    >
      {accepted ? (
        <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
      ) : (
        <XCircle className="w-6 h-6 flex-shrink-0" />
      )}
      <span>{message ?? (accepted ? 'String Accepted ✓' : 'String Rejected ✗')}</span>
    </motion.div>
  );
}
