import React from 'react';

// Define and export the possible statuses for each step
export type StepStatus = 'complete' | 'inProgress' | 'pending' | 'error';

interface VideoPipelineStatusProps {
  videoFetchedStatus: StepStatus;
  videoFetchErrorMsg?: string;
  transcriptionStatus: StepStatus;
  transcriptionErrorMsg?: string;
  rewriteScriptStatus: StepStatus;
  rewriteScriptErrorMsg?: string;
  // We might add more props later, like error messages for specific steps
}

// Helper to get icon and text color based on status
const getStatusStyles = (status: StepStatus) => {
  switch (status) {
    case 'complete':
      return { icon: CheckmarkCircleIcon, textColor: 'text-green-600', iconColor: 'text-green-500' };
    case 'inProgress':
      return { icon: ClockIcon, textColor: 'text-blue-600', iconColor: 'text-blue-500' };
    case 'error':
      return { icon: ErrorIcon, textColor: 'text-red-600', iconColor: 'text-red-500' };
    case 'pending':
    default:
      return { icon: GearIcon, textColor: 'text-gray-500', iconColor: 'text-gray-400' };
  }
};

const StatusText: React.FC<{ status: StepStatus }> = ({ status }) => {
    let text = 'Pending';
    if (status === 'complete') text = 'Complete';
    if (status === 'inProgress') text = 'In Progress';
    if (status === 'error') text = 'Error';
    return <>{text}</>;
};

// SVG Icons as React Components
const CheckmarkCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={`size-3 ${className}`} data-testid="geist-icon-checkmark-circle" viewBox="0 0 16 16" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM11.5303 6.53033L12.0607 6L11 4.93934L10.4697 5.46967L6.5 9.43934L5.53033 8.46967L5 7.93934L3.93934 9L4.46967 9.53033L5.96967 11.0303C6.26256 11.3232 6.73744 11.3232 7.03033 11.0303L11.5303 6.53033Z" />
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={`size-3 ${className}`} viewBox="0 0 16 16">
    <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
  </svg>
);

const GearIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={`size-3 ${className}`} viewBox="0 0 16 16">
    <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
    <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.901 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527-1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.115 2.692l.319.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.319c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.056 4.37l-.16-.292c-.415-.764.42 1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
  </svg>
);

const ErrorIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={`size-3 ${className}`} viewBox="0 0 16 16">
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
  </svg>
);

interface PipelineStepProps {
  stepNumber: number;
  title: string;
  status: StepStatus;
  errorMsg?: string;
  isLastStep?: boolean;
}

const PipelineStep: React.FC<PipelineStepProps> = ({ stepNumber, title, status, errorMsg, isLastStep }) => {
  const { icon: Icon, textColor, iconColor } = getStatusStyles(status);

  return (
    <>
      <div className="flex h-5 w-full min-w-0 items-center gap-2 text-[13px] mb-1">
        <div className="flex size-5 shrink-0 items-center justify-center">
          <Icon className={iconColor} />
        </div>
        <div className="group/file flex w-full min-w-0 items-center justify-between gap-2">
          <div className="flex-1 truncate text-left text-gray-700">{`${stepNumber}. ${title}`}</div>
          <div className={`font-mono text-xs ${textColor}`}><StatusText status={status} /></div>
        </div>
      </div>
      {status === 'error' && errorMsg && (
        <div className="pl-7 text-xs text-red-600 mb-1 truncate" title={errorMsg}>
          {errorMsg.length > 50 ? errorMsg.substring(0, 47) + '...' : errorMsg}
        </div>
      )}
      {!isLastStep && (
        <div className={`flex h-3 w-5 items-center justify-center ml-[0.125rem] ${status === 'error' && errorMsg ? 'mb-[2px]' : ''}`}>
          <div className="h-full w-[1px] bg-gray-300"></div>
        </div>
      )}
    </>
  );
};

const VideoPipelineStatus: React.FC<VideoPipelineStatusProps> = ({
  videoFetchedStatus,
  videoFetchErrorMsg,
  transcriptionStatus,
  transcriptionErrorMsg,
  rewriteScriptStatus,
  rewriteScriptErrorMsg,
}) => {
  return (
    <div className="not-prose group/block-preview bg-white flex w-full max-w-full flex-col justify-between overflow-hidden rounded-md border border-gray-300 shadow-[0px_2px_3px_-1px_hsla(0,0%,0%,0.04)] transition-all ease-in-out md:w-[400px]">
      <div className="flex h-9 w-full items-center justify-between gap-3 p-2 border-b border-gray-200">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <div className="flex items-center gap-1 whitespace-nowrap text-[13px] font-medium text-gray-800">
            {/* Static Dropdown Icon - for visual consistency with example */}
            <button className="focus-visible:ring-offset-background inline-flex shrink-0 cursor-default select-none items-center justify-center gap-1.5 whitespace-nowrap text-nowrap border font-medium outline-none ring-blue-600 transition-[background,border-color,color,transform,opacity,box-shadow] focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:ring-0 has-[:focus-visible]:ring-2 aria-disabled:cursor-not-allowed aria-disabled:ring-0 [&>svg]:pointer-events-none [&>svg]:size-4 [&_svg]:shrink-0 hover:bg-gray-100 focus-visible:bg-gray-100 border-transparent bg-transparent text-gray-900 hover:border-transparent focus:border-transparent focus-visible:border-transparent disabled:border-transparent disabled:bg-transparent disabled:text-gray-400 aria-disabled:border-transparent aria-disabled:bg-transparent aria-disabled:text-gray-400 size-5 rounded-sm">
              <svg data-testid="geist-icon" height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16" style={{ color: 'currentColor' }}>
                <path fillRule="evenodd" clipRule="evenodd" d="M12.0607 6.74999L11.5303 7.28032L8.7071 10.1035C8.31657 10.4941 7.68341 10.4941 7.29288 10.1035L4.46966 7.28032L3.93933 6.74999L4.99999 5.68933L5.53032 6.21966L7.99999 8.68933L10.4697 6.21966L11 5.68933L12.0607 6.74999Z" fill="currentColor"></path>
              </svg>
            </button>
            Video Content Pipeline
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="focus:border-gray-400 focus-visible:border-gray-400 disabled:border-gray-300 border-gray-400 hover:border-gray-400 focus-visible:ring-offset-background aria-disabled:border-gray-300 inline-flex shrink-0 cursor-default select-none items-center justify-center gap-1.5 whitespace-nowrap text-nowrap border font-medium outline-none ring-blue-600 transition-[background,border-color,color,transform,opacity,box-shadow] focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:ring-0 has-[:focus-visible]:ring-2 aria-disabled:cursor-not-allowed aria-disabled:bg-gray-100 aria-disabled:text-gray-400 aria-disabled:ring-0 [&>svg]:pointer-events-none [&>svg]:size-4 [&_svg]:shrink-0 bg-gray-50 text-gray-900 pointer-events-none has-[>kbd]:gap-2 has-[>svg]:px-2 has-[>kbd]:pr-[6px] h-5 rounded-sm px-1.5 text-xs">
            Status
          </div>
        </div>
      </div>
      <div className="bg-gray-50 overflow-hidden py-1.5 pl-2 pr-2.5">
        <div className="flex w-full flex-col overflow-hidden text-left text-gray-500">
          <PipelineStep stepNumber={1} title="Video Fetched from URL" status={videoFetchedStatus} errorMsg={videoFetchErrorMsg} />
          <PipelineStep stepNumber={2} title="Transcribing Audio" status={transcriptionStatus} errorMsg={transcriptionErrorMsg} />
          <PipelineStep stepNumber={3} title="Rewriting Script" status={rewriteScriptStatus} errorMsg={rewriteScriptErrorMsg} isLastStep />
        </div>
      </div>
    </div>
  );
};

export default VideoPipelineStatus; 