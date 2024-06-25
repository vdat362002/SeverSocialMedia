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
