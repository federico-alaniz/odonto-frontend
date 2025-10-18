'use client';

interface MedicalFormNoticeProps {
  type?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  message: string;
  className?: string;
}

export default function MedicalFormNotice({
  type = 'info',
  title,
  message,
  className = ""
}: MedicalFormNoticeProps) {
  const typeStyles = {
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: '💡',
      iconColor: 'text-blue-400',
      textColor: 'text-blue-700'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: '⚠️',
      iconColor: 'text-yellow-400',
      textColor: 'text-yellow-700'
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: '❌',
      iconColor: 'text-red-400',
      textColor: 'text-red-700'
    },
    success: {
      container: 'bg-green-50 border-green-200',
      icon: '✅',
      iconColor: 'text-green-400',
      textColor: 'text-green-700'
    }
  };

  const styles = typeStyles[type];

  return (
    <div className={`${styles.container} border rounded-md p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <div className={`w-5 h-5 ${styles.iconColor} mt-0.5`}>
            {styles.icon}
          </div>
        </div>
        <div className="ml-3">
          {title && (
            <h3 className={`text-sm font-medium ${styles.textColor} mb-1`}>
              {title}
            </h3>
          )}
          <p className={`text-sm ${styles.textColor}`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}