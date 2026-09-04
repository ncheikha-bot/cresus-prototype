import React from 'react';
import { AlertCircle } from './icons';

/**
 * Champ de formulaire avec libellé lié et message d'erreur rattaché.
 *
 * Le projet n'avait que 30 champs étiquetés sur 285 : les libellés étaient des
 * `<label>` sans `htmlFor`, donc invisibles pour un lecteur d'écran et sans
 * effet au clic. Les erreurs, elles, s'affichaient dans une liste en haut de
 * formulaire, sans marquage sur le champ concerné.
 */
export interface FormFieldProps {
  /** Identifiant unique : relie le libellé, le champ et son message d'erreur. */
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  /** Aide affichée sous le champ tant qu'il n'est pas en erreur. */
  hint?: React.ReactNode;
  placeholder?: string;
  required?: boolean;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  inputRef?: React.Ref<HTMLInputElement>;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  placeholder,
  required = false,
  type = 'text',
  inputMode,
  inputRef,
  className = '',
}) => {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-[#1A2753] mb-2">
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <input
        id={id}
        ref={inputRef}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        // Transition ciblée : la bordure d'erreur apparaît instantanément.
        // Un `transition-all` la faisait fondre sur 300 ms, retardant d'autant
        // le signal alors que c'est précisément ce qu'il faut voir tout de suite.
        className={`w-full px-4 py-3 rounded-xl outline-none transition-[box-shadow] duration-200 border-2 ${
          error
            ? 'bg-red-50 border-red-400 focus:ring-2 focus:ring-red-400'
            : 'bg-[#F5F6FA] border-transparent focus:ring-2 focus:ring-[#D6A93A]'
        }`}
      />

      {/* role="alert" : l'échec est annoncé, là où rien ne l'était auparavant. */}
      {error ? (
        <p id={errorId} role="alert" className="mt-2 flex items-start gap-1.5 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : (
        hint && <div id={hintId}>{hint}</div>
      )}
    </div>
  );
};
