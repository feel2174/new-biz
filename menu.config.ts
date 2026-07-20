// Define the menu items
// label: 화면에 표시되는 한국어 라벨 / href: 영문 경로
export type MenuItem = {
  label: string;
  href: string;
};

export const mainMenu: MenuItem[] = [
  { label: "홈", href: "/" },
  { label: "블로그", href: "/posts" },
  { label: "소개", href: "/about" },
];

export const contentMenu: MenuItem[] = [
  { label: "카테고리", href: "/posts/categories" },
];
