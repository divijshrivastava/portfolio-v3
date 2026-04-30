import type { TabId } from './types';

const iconSize = 16;

function TsxIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 16 16" fill="none">
      <rect width="16" height="16" rx="2" fill="#61DAFB" fillOpacity={0.15} />
      <text x="8" y="11.5" textAnchor="middle" fontSize="8" fontWeight="700" fill="#61DAFB">
        R
      </text>
    </svg>
  );
}

function TsIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 16 16" fill="none">
      <rect width="16" height="16" rx="2" fill="#3178C6" fillOpacity={0.15} />
      <text x="8" y="11.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="#3178C6">
        TS
      </text>
    </svg>
  );
}

function JsonIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 16 16" fill="none">
      <rect width="16" height="16" rx="2" fill="#F9E2AF" fillOpacity={0.15} />
      <text x="8" y="11.5" textAnchor="middle" fontSize="6" fontWeight="700" fill="#F9E2AF">
        {'{}'}
      </text>
    </svg>
  );
}

function MdIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 16 16" fill="none">
      <rect width="16" height="16" rx="2" fill="#CDD6F4" fillOpacity={0.15} />
      <text x="8" y="11.5" textAnchor="middle" fontSize="6" fontWeight="700" fill="#CDD6F4">
        MD
      </text>
    </svg>
  );
}

function CssIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 16 16" fill="none">
      <rect width="16" height="16" rx="2" fill="#89B4FA" fillOpacity={0.15} />
      <text x="8" y="11.5" textAnchor="middle" fontSize="6" fontWeight="700" fill="#89B4FA">
        #
      </text>
    </svg>
  );
}

const iconMap: Record<TabId, React.ComponentType> = {
  'home.tsx': TsxIcon,
  'systems.ts': TsIcon,
  'impact.json': JsonIcon,
  'thinking.md': MdIcon,
  'blog.ts': TsIcon,
  'skills.json': JsonIcon,
  'contact.css': CssIcon,
};

export function FileIcon({ tabId }: { tabId: TabId }) {
  const Icon = iconMap[tabId];
  return <Icon />;
}
