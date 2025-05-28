import { BASE_URL } from "../config";
import { getAccessToken } from "../utils/auth";

const ENDPOINTS = {
  LOGIN: "/login",
  REGISTER: "/register",
  MIND_TRACKER: "/mindTracker",
  MIND_TRACKER_CHECK: "/mindTracker/check",
};

export async function getRegister(username, name, email, password) {
  const data = JSON.stringify({ username, name, email, password });
  const response = await fetch(`${BASE_URL}${ENDPOINTS.REGISTER}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data,
  });

  const responseJson = await response.json();

  return responseJson;
}

export async function getLogin(usernameOrEmail, password) {
  const data = JSON.stringify({ usernameOrEmail, password });
  const response = await fetch(`${BASE_URL}${ENDPOINTS.LOGIN}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data,
  });

  const responseJson = await response.json();

  return responseJson;
}

export async function checkTodayEntry() {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    throw new Error("Anda belum login. Silakan login terlebih dahulu.");
  }

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const response = await fetch(
    `${BASE_URL}${ENDPOINTS.MIND_TRACKER_CHECK}/${todayStr}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const result = await response.json();

  if (response.error) {
    throw new Error(result.message || "Terjadi kesalahan saat mengecek data");
  }

  return result;
}

export async function getEntryByDate(dateStr) {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    throw new Error("Anda belum login. Silakan login terlebih dahulu.");
  }

  const dateObj = new Date(dateStr);
  const apiDateStr = dateObj.toISOString().split("T")[0];

  const response = await fetch(
    `${BASE_URL}${ENDPOINTS.MIND_TRACKER}/${apiDateStr}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return await response.json();
}

export async function saveEntry(data) {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    throw new Error("Anda belum login. Silakan login terlebih dahulu.");
  }

  const response = await fetch(`${BASE_URL}${ENDPOINTS.MIND_TRACKER}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (response.error) {
    throw new Error(result.message || "Terjadi kesalahan saat menyimpan data");
  }

  return result;
}

export async function getStories() {
  const accessToken = getAccessToken();
  try {
    const response = await fetch(`${BASE_URL}/story`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching stories:", error);
    return { error: true, message: "Gagal menampilkan cerita" };
  }
}

export async function postStory(content, isAnonymous = false) {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${BASE_URL}/story`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content,
        isAnonymous,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Gagal mengunggah cerita");
    }

    return data;
  } catch (error) {
    console.error("Error posting story:", error);
    throw error;
  }
}

export async function getUserProfile(username) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Anda belum login. Silakan login terlebih dahulu.");
  }

  const response = await fetch(`${BASE_URL}/profile/${username}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const result = await response.json();

  if (response.error) {
    throw new Error(
      result.message || "Terjadi kesalahan saat mengambil profil"
    );
  }

  return result;
}

export async function getStoryDetail(storyId) {
  const response = await fetch(`/story/${storyId}`);
  return await response.json();
}

export async function likeStory(storyId) {
  try {
    if (!storyId) {
      throw new Error("Invalid story ID");
    }

    const token = getAccessToken();
    if (!token) throw new Error("Authentication required");

    const response = await fetch(`${BASE_URL}/story/${storyId}/like`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to like story");
    }

    return data.likeCount;
  } catch (error) {
    console.error("Failed to like story:", error);
    throw error;
  }
}

export async function commentOnStory(storyId, content) {
  const response = await fetch(`/story/${storyId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify({ content }),
  });
  return await response.json();
}
