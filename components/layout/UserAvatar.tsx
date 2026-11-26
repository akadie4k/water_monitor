import { cn } from "@/lib/cn";
import { CURRENT_USER, userInitial, type AppUser } from "@/lib/user";

export interface UserAvatarProps {
  user?: AppUser;
  className?: string;
}

/** รูปผู้ใช้: ถ้าไม่มีรูปแสดงตัวอักษรแรกของชื่อบนพื้นสีฟ้าอ่อน (ตกแต่งเท่านั้น — ชื่ออยู่ข้างๆ เสมอ) */
export default function UserAvatar({ user = CURRENT_USER, className }: UserAvatarProps) {
  const base = cn("size-9 shrink-0 rounded-full ring-1 ring-inset ring-primary/15", className);
  if (user.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={user.avatarUrl} alt="" aria-hidden="true" className={cn(base, "object-cover")} />;
  }
  return (
    <span
      aria-hidden="true"
      className={cn(base, "grid place-items-center bg-primary-soft font-display text-[15px] font-medium text-primary")}
    >
      {userInitial(user.name)}
    </span>
  );
}
