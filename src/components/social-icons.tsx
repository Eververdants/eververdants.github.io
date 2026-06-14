import React from 'react';
import {
  siGithub,
  siBilibili,
  siTiktok,
  siQq,
  siWechat,
} from 'simple-icons';

interface IconProps {
  color: string;
  size?: number;
}

const iconData: Record<string, { path: string; hex: string }> = {
  github: { path: siGithub.path, hex: siGithub.hex },
  bilibili: { path: siBilibili.path, hex: siBilibili.hex },
  douyin: { path: siTiktok.path, hex: siTiktok.hex },
  qq: { path: siQq.path, hex: siQq.hex },
  wechat: { path: siWechat.path, hex: siWechat.hex },
};

const SimpleIcon: React.FC<IconProps & { iconName: string }> = ({ iconName, color, size = 24 }) => {
  const data = iconData[iconName];
  if (!data) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d={data.path} />
    </svg>
  );
};

export const getSocialIcon = (iconName: string, color: string, size?: number) => {
  return <SimpleIcon iconName={iconName} color={color} size={size} />;
};
