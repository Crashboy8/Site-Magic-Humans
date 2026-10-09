import { beforeEach, describe, expect, it, vi } from "vitest";
import { client } from "@/i18n/messages/client";

const auth = {
  getClaims: vi.fn(),
  signInWithOtp: vi.fn(),
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  updateUser: vi.fn(),
};
const redirect = vi.fn((url: string) => {
  throw new Error(`REDIRECT ${url}`);
});

vi.mock("next/headers", () => ({ headers: async () => new Headers({ origin: "http://localhost:3000" }) }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => redirect(url) }));
vi.mock("@/i18n/server", () => ({ getI18n: async () => ({ locale: "fr", t: { client: client.fr } }) }));
vi.mock("@/lib/supabase/server", () => ({ supabaseServer: async () => ({ auth, rpc: vi.fn() }) }));
vi.mock("@/data/repository", () => ({ checkInvitationCode: vi.fn(async () => libre) }));
vi.mock("@/lib/guestTransfer", () => ({ claimPendingGuestTransfer: vi.fn(async () => 0), rememberGuestTransfer: vi.fn() }));
vi.mock("./acces", () => ({ activerEtOrienter: vi.fn() }));

let libre = true;
const { creerMotDePasseAction, rejoindreAction } = await import("./actions");
const E = client.fr.erreurs;

function form(champs: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries({ code: "MH-CLAIRE", prenom: "Claire", email: "claire@example.com", ...champs })) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  libre = true;
  vi.clearAllMocks();
  auth.getClaims.mockResolvedValue({ data: { claims: {} } });
  auth.signInWithOtp.mockResolvedValue({ error: null });
});

describe("écran 1 : lien par mail par défaut, mot de passe facultatif", () => {
  it("sans mot de passe : lien par mail, compte marqué sans mot de passe", async () => {
    expect(await rejoindreAction({}, form({}))).toEqual({ envoye: "claire@example.com" });
    expect(auth.signUp).not.toHaveBeenCalled();
    const options = auth.signInWithOtp.mock.calls[0][0].options;
    expect(options.data).toMatchObject({ invitation_code: "MH-CLAIRE", first_name: "Claire", sans_mot_de_passe: true });
    expect(options.emailRedirectTo).toContain("/auth/callback/?next=");
  });

  it("mot de passe trop court : erreur sur le champ, rien n'est envoyé", async () => {
    expect(await rejoindreAction({}, form({ mot_de_passe: "court" }))).toEqual({ champs: { motDePasse: E.motDePasseCourt } });
    expect(auth.signUp).not.toHaveBeenCalled();
    expect(auth.signInWithOtp).not.toHaveBeenCalled();
  });

  it("avec mot de passe : inscription classique avec le code, mail de confirmation", async () => {
    auth.signUp.mockResolvedValue({ data: { user: { identities: [{}] }, session: null }, error: null });
    expect(await rejoindreAction({}, form({ mot_de_passe: "un-bon-secret" }))).toEqual({ envoye: "claire@example.com" });
    const arg = auth.signUp.mock.calls[0][0];
    expect(arg.password).toBe("un-bon-secret");
    expect(arg.options.data).toEqual({ invitation_code: "MH-CLAIRE", first_name: "Claire", lang: "fr" });
    expect(auth.signInWithOtp).not.toHaveBeenCalled();
  });

  it("avec mot de passe, confirmation désactivée : connecté tout de suite, activation du code", async () => {
    auth.signUp.mockResolvedValue({ data: { user: { identities: [{}] }, session: {} }, error: null });
    await expect(rejoindreAction({}, form({ mot_de_passe: "un-bon-secret" }))).rejects.toThrow(/REDIRECT \/mon-espace\/activer\//);
  });

  it("adresse déjà inscrite : connexion avec ce mot de passe, sinon erreur sur le champ", async () => {
    auth.signUp.mockResolvedValue({ data: { user: { identities: [] }, session: null }, error: null });
    auth.signInWithPassword.mockResolvedValue({ error: { message: "Invalid login credentials" } });
    expect(await rejoindreAction({}, form({ mot_de_passe: "un-bon-secret" }))).toEqual({ champs: { motDePasse: E.motDePasseFaux } });
    auth.signInWithPassword.mockResolvedValue({ error: null });
    await expect(rejoindreAction({}, form({ mot_de_passe: "un-bon-secret" }))).rejects.toThrow(/REDIRECT \/mon-espace\/activer\//);
  });

  it("code déjà servi : pas de nouveau compte, seulement la connexion", async () => {
    libre = false;
    auth.signInWithPassword.mockResolvedValue({ error: { message: "Invalid login credentials" } });
    expect(await rejoindreAction({}, form({ mot_de_passe: "un-bon-secret" }))).toEqual({ champs: { code: E.code } });
    expect(auth.signUp).not.toHaveBeenCalled();
  });
});

describe("Mon espace : créer un mot de passe (facultatif)", () => {
  it("8 caractères minimum", async () => {
    const fd = new FormData();
    fd.set("mot_de_passe", "court");
    expect(await creerMotDePasseAction({}, fd)).toEqual({ erreur: E.motDePasseCourt });
    expect(auth.updateUser).not.toHaveBeenCalled();
  });

  it("updateUser avec le mot de passe, et le compte n'est plus marqué sans mot de passe", async () => {
    auth.updateUser.mockResolvedValue({ error: null });
    const fd = new FormData();
    fd.set("mot_de_passe", "un-bon-secret");
    expect(await creerMotDePasseAction({}, fd)).toEqual({ ok: true });
    expect(auth.updateUser).toHaveBeenCalledWith({ password: "un-bon-secret", data: { sans_mot_de_passe: false } });
  });
});
