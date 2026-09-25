import { UserProfile, UserRole } from "@/lib/types";

export async function getAdminUsers(): Promise<UserProfile[]> {
  try {
    const res = await fetch("/api/admin/users", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    const data = await res.json();
    return Array.isArray(data.users) ? data.users : [];
  } catch (error) {
    console.error("getAdminUsers error:", error);
    return [];
  }
}

export async function createAdminUser(payload: Partial<UserProfile>): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to create user" };
    }
    return { success: true, user: data.user };
  } catch (error: any) {
    return { success: false, error: error?.message || "Network error" };
  }
}

export async function updateAdminUserProfile(payload: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to update user profile" };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Network error" };
  }
}

export async function deleteAdminUser(email?: string, uid?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const params = new URLSearchParams();
    if (email) params.set("email", email);
    if (uid) params.set("uid", uid);

    const res = await fetch(`/api/admin/users?${params.toString()}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to delete user" };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Network error" };
  }
}
