import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the requesting user is a super_admin
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Non authentifié");
    }

    // Check if user has super_admin role
    const { data: roles, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "super_admin");

    if (roleError || !roles || roles.length === 0) {
      throw new Error("Accès refusé: Super Admin requis");
    }

    // Get request body
    const { email, password, full_name, role, school_id } = await req.json();

    if (!email || !password || !full_name) {
      throw new Error("Email, mot de passe et nom complet requis");
    }

    // Create the auth user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name,
      },
    });

    if (createError) throw createError;

    // The profile should be created automatically by the trigger
    // Wait a bit to ensure trigger completes
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Assign role if provided
    if (role && newUser.user) {
      const roleData: any = {
        user_id: newUser.user.id,
        role: role,
      };

      // Add school_id only if it's a school_admin role
      if (role === "school_admin" && school_id) {
        roleData.school_id = school_id;

        // Update the profile with school_id
        await supabaseAdmin
          .from("profiles")
          .update({ school_id })
          .eq("user_id", newUser.user.id);

        // Set the school as free and unlimited for super_admin created accounts
        await supabaseAdmin
          .from("schools")
          .update({ 
            subscription_plan: "free",
            max_students: -1,
            subscription_status: "active"
          })
          .eq("id", school_id);
      }

      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .insert([roleData]);

      if (roleError) {
        console.error("Error assigning role:", roleError);
        // Don't throw here, user is created successfully
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: newUser.user,
        message: "Utilisateur créé avec succès",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error creating user:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
