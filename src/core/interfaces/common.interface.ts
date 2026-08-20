export interface ActionResponse<T = unknown> {
  status: "SUCCESS" | "ERROR";
  error?: string;
  data?: T;
}

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
