/**
 * Donation Platform Integration Widget
 * External websites drop this script in to render dynamic donation modals.
 * 
 * Usage:
 * <div id="donation-widget" data-backend="http://localhost:8000"></div>
 * <script src="http://localhost:3000/widget.js"></script>
 */
(function () {
  const container = document.getElementById("donation-widget");
  if (!container) return;

  const backendUrl = container.getAttribute("data-backend") || "http://localhost:8000";

  // Create UI Elements inside container
  container.innerHTML = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 440px; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); background: #ffffff;">
      <h3 style="margin-top: 0; font-size: 1.25rem; color: #111827;">Support Our Cause</h3>
      <p style="font-size: 0.875rem; color: #4b5563; margin-bottom: 16px;">Make a test donation to feature your avatar on the donor wall.</p>
      
      <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        <button type="button" class="dms-amt-btn" data-val="10" style="flex: 1; padding: 8px; border: 1px solid #2563eb; border-radius: 6px; background: #eff6ff; color: #2563eb; font-weight: bold; cursor: pointer;">₹10</button>
        <button type="button" class="dms-amt-btn" data-val="50" style="flex: 1; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; background: #f9fafb; cursor: pointer;">₹50</button>
        <button type="button" class="dms-amt-btn" data-val="100" style="flex: 1; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; background: #f9fafb; cursor: pointer;">₹100</button>
      </div>

      <form id="dms-form" style="display: flex; flex-direction: column; gap: 12px;">
        <input type="number" id="dms-amount" value="10" placeholder="Custom Amount (INR)" required style="padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;" />
        <input type="text" id="dms-name" placeholder="Full Name" required style="padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;" />
        <button type="submit" id="dms-submit" style="padding: 12px; background: #2563eb; color: #ffffff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Donate Now</button>
      </form>
      <div id="dms-msg" style="margin-top: 12px; font-size: 0.875rem; text-align: center;"></div>
    </div>
  `;

  // Handle Amount Selection
  const amountInput = document.getElementById("dms-amount");
  const buttons = container.querySelectorAll(".dms-amt-btn");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      amountInput.value = btn.getAttribute("data-val");
      buttons.forEach(b => {
        b.style.background = "#f9fafb";
        b.style.color = "#000000";
        b.style.border = "1px solid #d1d5db";
      });
      btn.style.background = "#eff6ff";
      btn.style.color = "#2563eb";
      btn.style.border = "1px solid #2563eb";
    });
  });

  // Handle Form Submission
  const form = document.getElementById("dms-form");
  const msg = document.getElementById("dms-msg");
  const submitBtn = document.getElementById("dms-submit");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerText = "Processing...";
    msg.innerText = "";

    try {
      const response = await fetch(`${backendUrl}/api/v1/donations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donor_name: document.getElementById("dms-name").value,
          amount: parseFloat(amountInput.value)
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not process donation");

      msg.style.color = "#059669";
      msg.innerText = `✅ Payment Order Created! Order ID: ${data.order_id}`;
    } catch (err) {
      msg.style.color = "#dc2626";
      msg.innerText = `❌ Error: ${err.message}`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = "Donate Now";
    }
  });
})();
