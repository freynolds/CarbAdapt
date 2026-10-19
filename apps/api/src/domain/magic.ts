export type IssuedLink = {
  email: string;
  url: string;
  createdAt: string;
};

const issued: IssuedLink[] = [];

export function rememberMagicLink(link: IssuedLink): void {
  issued.unshift(link);
  issued.splice(20);
  console.info(`CarbAdapt magic link for ${link.email}: ${link.url}`);
}

export function recentMagicLinks(): IssuedLink[] {
  return issued.slice();
}
