import {
  BookmarkMinus,
  CirclePlay,
  Gamepad2,
  Save,
  Settings,
  SquareKanban,
  UserPlus,
  Users,
} from "lucide-react";

export const exploreEvents = [
  { title: "Learning", Icon: CirclePlay, isNew: true },
  { title: "Insights", Icon: SquareKanban, isNew: false },
  { title: "Find friends", Icon: UserPlus, isNew: false },
  { title: "Bookmarks", Icon: BookmarkMinus, isNew: false },
  { title: "Group", Icon: Users, isNew: false },
  { title: "Gaming", Icon: Gamepad2, isNew: true },
  { title: "Settings", Icon: Settings, isNew: false },
  { title: "Save post", Icon: Save, isNew: false },
];