export const ANN_TYPES = ["news", "event", "promo", "system"] as const;

export type AnnouncementFormState = {
  title: string;
  type: string;
  description: string;
  imageUrl: string;
  link: string;
};

export const EMPTY_FORM: AnnouncementFormState = {
  title: "",
  type: "news",
  description: "",
  imageUrl: "",
  link: "",
};
