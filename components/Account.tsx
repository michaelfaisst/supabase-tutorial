import { Database } from "@/types/supabase";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { Session } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

type Profiles = Database["public"]["Tables"]["profiles"]["Row"];

interface Props {
    session: Session;
}

const Account = ({ session }: Props) => {
    const supabase = useSupabaseClient<Database>();
    const user = useUser();

    const [loading, setLoading] = useState(true);
    const [userName, setUsername] = useState<Profiles["username"]>(null);
    const [website, setWebsite] = useState<Profiles["website"]>(null);
    const [avatarUrl, setAvatarUrl] = useState<Profiles["avatar_url"]>(null);

    useEffect(() => {
        getProfile();
    }, [session]);

    const getProfile = async () => {
        try {
            setLoading(true);
            if (!user) throw new Error("No user");

            let { data, error, status } = await supabase
                .from("profiles")
                .select("username, website, avatar_url")
                .eq("id", user.id)
                .single();

            if (error && status !== 406) {
                throw error;
            }

            if (data) {
                setUsername(data.username);
                setWebsite(data.website);
                setAvatarUrl(data.avatar_url);
            }
        } catch (error) {
            alert("Error laoding user data!");
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (
        username: Profiles["username"],
        website: Profiles["website"],
        avatarUrl: Profiles["avatar_url"]
    ) => {
        try {
            setLoading(true);

            if (!user) throw new Error("No user");

            const updates = {
                id: user.id,
                username,
                website,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString()
            };

            let { error } = await supabase.from("profiles").upsert(updates);

            if (error) throw error;
            alert("Profile updated");
        } catch (error) {
            alert("Error updating the data");
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-widget">
            <div>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={session.user.email}
                    disabled
                />
            </div>

            <div>
                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    type="text"
                    value={userName || ""}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="website">Website</label>
                <input
                    id="website"
                    type="url"
                    value={website || ""}
                    onChange={(e) => setWebsite(e.target.value)}
                />
            </div>

            <div>
                <button
                    className="button primary block"
                    onClick={() => updateProfile(userName, website, avatarUrl)}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Update"}
                </button>
            </div>

            <div>
                <button
                    className="button block"
                    onClick={() => supabase.auth.signOut()}
                >
                    Sign out
                </button>
            </div>
        </div>
    );
};

export default Account;
