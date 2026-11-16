document.addEventListener("DOMContentLoaded", () => {
  // Tahun otomatis di bagian footer.
  document.querySelectorAll(".current-year").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  // Menu navigasi untuk layar kecil.
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Tutup menu" : "Buka menu");
      menuToggle.textContent = isOpen ? "✕" : "☰";
    });
  }

  // Harga contoh per jam.
  const consoleData = {
    ps3: { name: "PlayStation 3", price: 5000 },
    ps4: { name: "PlayStation 4", price: 10000 },
    ps5: { name: "PlayStation 5", price: 15000 }
  };
  const rupiah = (amount) => new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0
  }).format(amount);

  // Tombol sewa di halaman daftar mengirim pilihan konsol ke halaman pemesanan.
  document.querySelectorAll(".choose-console").forEach((button) => {
    button.addEventListener("click", () => {
      try {
        localStorage.setItem("rentalSelectedConsole", button.dataset.console);
      } catch (error) {
        // Website tetap dapat digunakan jika localStorage tidak tersedia.
      }
    });
  });

  const form = document.querySelector("#booking-form");
  if (!form) return;

  const consoleSelect = document.querySelector("#console");
  const durationInput = document.querySelector("#duration");
  const quantityInput = document.querySelector("#quantity");
  const dateInput = document.querySelector("#rental-date");
  const result = document.querySelector("#booking-result");

  // Mencegah pemilihan tanggal yang sudah lewat.
  if (dateInput) {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString().split("T")[0];
    dateInput.min = localDate;
  }

  // Mengambil pilihan konsol dari tombol "Sewa Sekarang".
  try {
    const savedConsole = localStorage.getItem("rentalSelectedConsole");
    if (savedConsole && consoleData[savedConsole]) {
      consoleSelect.value = savedConsole;
      localStorage.removeItem("rentalSelectedConsole");
    }
  } catch (error) {
    // Pengguna masih bisa memilih konsol secara manual.
  }

  function updateSummary() {
    const selected = consoleData[consoleSelect.value];
    const duration = Math.max(1, Number.parseInt(durationInput.value, 10) || 1);
    const quantity = Math.max(1, Number.parseInt(quantityInput.value, 10) || 1);
    const price = selected ? selected.price : 0;
    const total = price * duration * quantity;

    document.querySelector("#summary-console").textContent = selected ? selected.name : "Belum dipilih";
    document.querySelector("#summary-price").textContent = rupiah(price);
    document.querySelector("#summary-duration").textContent = `${duration} jam`;
    document.querySelector("#summary-quantity").textContent = `${quantity} unit`;
    document.querySelector("#summary-total").textContent = rupiah(total);
    return { selected, duration, quantity, price, total };
  }

  [consoleSelect, durationInput, quantityInput].forEach((element) => {
    element.addEventListener("input", updateSummary);
    element.addEventListener("change", updateSummary);
  });
  updateSummary();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    result.hidden = false;
    result.classList.remove("error");

    if (!form.reportValidity()) {
      result.classList.add("error");
      result.textContent = "Periksa kembali formulir. Pastikan semua kolom wajib sudah diisi dengan benar.";
      return;
    }

    const details = updateSummary();
    if (!details.selected) {
      result.classList.add("error");
      result.textContent = "Silakan pilih jenis PlayStation terlebih dahulu.";
      consoleSelect.focus();
      return;
    }

    if (details.duration < 1 || details.duration > 24 || details.quantity < 1 || details.quantity > 5) {
      result.classList.add("error");
      result.textContent = "Durasi harus 1–24 jam dan jumlah konsol harus 1–5 unit.";
      return;
    }

    const name = document.querySelector("#customer-name").value.trim();
    const date = dateInput.value;
    const formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric"
    });

    result.innerHTML = "";
    const title = document.createElement("strong");
    title.textContent = "Pesanan berhasil disimulasikan!";
    const message = document.createElement("p");
    message.textContent = `Terima kasih, ${name}. Pesanan ${details.selected.name} untuk tanggal ${formattedDate} dengan total ${rupiah(details.total)} telah diringkas.`;
    const note = document.createElement("p");
    note.textContent = "Catatan: ini hanya simulasi di browser. Pesanan belum dikirim ke pemilik rental.";
    result.append(title, message, note);
    result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
});
