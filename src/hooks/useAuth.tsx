import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: string | null;
  companyId: string | null;
  employeeData: any | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, loading: true, role: null,
  companyId: null, employeeData: null, signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [employeeData, setEmployeeData] = useState<any | null>(null);

  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (data) {
      setRole(data.role);
      
      if (data.role === "company") {
        const { data: company } = await supabase
          .from("companies")
          .select("id")
          .eq("owner_id", userId)
          .maybeSingle();
        if (company) setCompanyId(company.id);
      }
      
      if (data.role === "employee") {
        const { data: emp } = await supabase
          .from("employees")
          .select("*, companies(id, company_name, manager_name, email)")
          .eq("user_id", userId)
          .maybeSingle();
        if (emp) {
          setEmployeeData(emp);
          setCompanyId(emp.company_id);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchUserRole(session.user.id), 0);
        } else {
          setRole(null);
          setCompanyId(null);
          setEmployeeData(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setCompanyId(null);
    setEmployeeData(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, role, companyId, employeeData, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
