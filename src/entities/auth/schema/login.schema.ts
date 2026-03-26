import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다').min(1, '이메일을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 최소 8자 입니다'),
});

export type LoginForm = z.infer<typeof loginSchema>;
