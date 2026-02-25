async function run() {
    try {
        const adminEmail = "admin@medusa-test.com"; // Standard seed admin email
        const adminPass = "supersecret";

        console.log("1. Authenticating as Root Admin...");
        let res = await fetch("http://localhost:9000/auth/user/emailpass", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: adminEmail, password: adminPass })
        });
        let data = await res.json();
        const token = data.token;

        if (!token) {
            throw new Error("Failed to authenticate root admin: " + JSON.stringify(data));
        }

        console.log("2. Fetching API Keys...");
        res = await fetch("http://localhost:9000/admin/api-keys?type=publishable", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        data = await res.json();

        const myKey = data.api_keys.find(k => k.token === "pk_81aff166b18fded7b325c051c8bbb573fe3e5457632ea17cca2fa0e3b1ad202f");
        if (!myKey) {
            throw new Error("Could not find the Storefront API Key.");
        }

        console.log(`Found Key ID: ${myKey.id}`);

        console.log("3. Fetching Sales Channels...");
        res = await fetch("http://localhost:9000/admin/sales-channels?limit=100", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        data = await res.json();

        const defaultSc = data.sales_channels.find(sc => sc.name === "Default Sales Channel");
        if (!defaultSc) throw new Error("Could not find Default Sales Channel.");

        const allScIds = data.sales_channels.map(sc => sc.id);
        const idsToRemove = allScIds.filter(id => id !== defaultSc.id);
        const idsToAdd = [defaultSc.id];

        console.log(`4. Re-scoping Key...`);
        console.log(`Adding: ${JSON.stringify(idsToAdd)}`);
        console.log(`Removing all others: ${JSON.stringify(idsToRemove)}`);

        res = await fetch(`http://localhost:9000/admin/api-keys/${myKey.id}/sales-channels`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ add: idsToAdd, remove: idsToRemove })
        });

        if (!res.ok) {
            data = await res.json();
            throw new Error("Failed to update: " + JSON.stringify(data));
        }

        console.log("SUCCESS! The Storefront Cart API will no longer crash due to multi-channel ambiguity.");
    } catch (e) {
        console.error(e.message);
    }
}

run();
