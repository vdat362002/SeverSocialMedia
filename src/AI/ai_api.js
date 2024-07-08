export async function predictText(text) {
  try {
    const response = await fetch(`${process.env.AI_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    console.log(result);
    return result.toxic_words;
  } catch (error) {
    console.error("Error:", error);
  }
}
export async function detectViolence(photo) {
  try {
    const formData = new FormData();
    formData.append("url", photo.url)
    const response = await fetch(`${process.env.AI_URL}/detect-violence`, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    return { ...photo, isViolence: Array.from(result.results?.predictions).some(pre => pre.class_id === 1) }
  } catch (error) {
    console.error("Error:", error);
  }
}
