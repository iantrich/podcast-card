export interface PodcastCardConfig {
  type: string;
  entity: string;
  name?: string;
  icon?: string;
  default_target?: string;
  show_player?: boolean;
  custom_player?: boolean;
  mime_type?: string;
}

export interface Podcast {
  title: string;
  link: string;
  description: string;
  cover_url: string;
  episodes: Episode[];
}

export interface Episode {
  title: string;
  url: string;
  mime_type: string;
  guid: string;
  link: string;
  published: string;
  total_time: string;
}
