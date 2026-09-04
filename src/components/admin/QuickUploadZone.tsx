import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Sparkles } from '../ui/icons';

interface QuickUploadZoneProps {
  onUpload: () => void;
  isVisible: boolean;
}

export const QuickUploadZone: React.FC<QuickUploadZoneProps> = ({ onUpload, isVisible }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    onUpload();
  }, [onUpload]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#1A2753]/80 backdrop-blur-md z-40 flex items-center justify-center"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            className="bg-white rounded-3xl p-16 shadow-2xl border-4 border-dashed border-[#D6A93A] max-w-lg"
          >
            <div className="text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="inline-block mb-6"
              >
                <Upload className="w-24 h-24 text-[#D6A93A] mx-auto" />
              </motion.div>
              
              <h3 className="text-2xl text-[#1A2753] mb-3 flex items-center justify-center gap-2">
                Déposez vos fichiers ici
                <Sparkles className="w-6 h-6 text-[#D6A93A]" />
              </h3>
              <p className="text-[#273A7A]/80">
                Glissez-déposez pour uploader rapidement
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
