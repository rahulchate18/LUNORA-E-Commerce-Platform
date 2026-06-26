import { wrapEmailLayout } from "./layout.js";
export function getWelcomeTemplate(name, loginUrl) {
    const content = `
    <h1>Welcome to LUNORA, ${name}</h1>
    <p>We are delighted to welcome you to the inner circle of LUNORA—where modern luxury meets timeless elegance.</p>
    <p>Your account has been successfully created. You can now browse our exclusive collections of handcrafted luxury bags, curate your personal wishlist, and experience seamless, priority checkout.</p>
    <p>To celebrate your arrival, use code <strong style="color: #D4A373;">WELCOME200</strong> at checkout for a flat ₹200 savings on your first purchase.</p>
    <div style="text-align: center;">
      <a href="${loginUrl}" class="btn">Explore Atelier</a>
    </div>
    <div class="divider"></div>
    <p>If you have any questions about our designs, stitching materials, or orders, our concierge desk is always at your disposal at <a href="mailto:support@lunora.com" style="color: #D4A373; text-decoration: none;">support@lunora.com</a>.</p>
    <p>Warmest regards,<br><strong>The LUNORA Atelier Team</strong></p>
  `;
    return wrapEmailLayout("Welcome to LUNORA", content);
}
//# sourceMappingURL=welcome.js.map