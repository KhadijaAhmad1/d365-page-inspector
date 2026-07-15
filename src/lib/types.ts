export interface D365Context {
  environment: string;
  environmentType: string;
  legalEntity: string;
  user: string;
  pageTitle: string;
  formName: string;
  menuItem: string;
  url: string;
  timestamp: string;
}

export interface SavedPage extends D365Context {
  id: string;
  savedAt: string;
}

export type MessageRequest = { type: "CAPTURE_CONTEXT" };
export type MessageResponse = D365Context | { error: string };
