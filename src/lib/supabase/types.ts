export type UserRole =
  | "program_leader"
  | "head_coach"
  | "assistant_coach"
  | "parent"
  | "volunteer";

export type PlayerPosition =
  | "attack"
  | "midfield"
  | "defense"
  | "goalie"
  | "unspecified";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_path: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileRole = {
  id: string;
  profile_id: string;
  role: UserRole;
  team_id: string | null;
  created_at: string;
};

export type Team = {
  id: string;
  name: string;
  season: string | null;
  age_group: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type Player = {
  id: string;
  team_id: string;
  first_name: string;
  last_name: string;
  jersey: string | null;
  position: PlayerPosition;
  grade: string | null;
  photo_path: string | null;
  created_at: string;
  updated_at: string;
};

export type PlayerVisibility = {
  player_id: string;
  show_name: boolean;
  show_jersey: boolean;
  show_position: boolean;
  show_grade: boolean;
  show_photo: boolean;
  show_parents: boolean;
  updated_at: string;
};

export type PlayerParent = {
  player_id: string;
  profile_id: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_path?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      profile_roles: {
        Row: ProfileRole;
        Insert: {
          id?: string;
          profile_id: string;
          role: UserRole;
          team_id?: string | null;
          created_at?: string;
        };
        Update: { role?: UserRole; team_id?: string | null };
        Relationships: [];
      };
      teams: {
        Row: Team;
        Insert: {
          id?: string;
          name: string;
          season?: string | null;
          age_group?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          season?: string | null;
          age_group?: string | null;
          is_public?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      players: {
        Row: Player;
        Insert: {
          id?: string;
          team_id: string;
          first_name: string;
          last_name: string;
          jersey?: string | null;
          position?: PlayerPosition;
          grade?: string | null;
          photo_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          first_name?: string;
          last_name?: string;
          jersey?: string | null;
          position?: PlayerPosition;
          grade?: string | null;
          photo_path?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      player_visibility: {
        Row: PlayerVisibility;
        Insert: {
          player_id: string;
          show_name?: boolean;
          show_jersey?: boolean;
          show_position?: boolean;
          show_grade?: boolean;
          show_photo?: boolean;
          show_parents?: boolean;
          updated_at?: string;
        };
        Update: {
          show_name?: boolean;
          show_jersey?: boolean;
          show_position?: boolean;
          show_grade?: boolean;
          show_photo?: boolean;
          show_parents?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      player_parents: {
        Row: PlayerParent;
        Insert: { player_id: string; profile_id: string; created_at?: string };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      player_position: PlayerPosition;
    };
    CompositeTypes: Record<string, never>;
  };
};
