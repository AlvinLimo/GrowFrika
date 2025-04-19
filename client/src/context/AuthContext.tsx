// // src/context/AuthContext.tsx
// import { createContext, useContext, useState, useEffect } from "react"
// import { Session, User } from "@supabase/supabase-js"
// import supabase from "../lib/supabase"

// type AuthContextType = {
//   user: User | null
//   loginWithEmail: (email: string, password: string) => Promise<void>
//   loginWithProvider: (provider: "google" | "azure") => void
//   logout: () => void
// }

// const AuthContext = createContext<AuthContextType | null>(null)

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null)

//   useEffect(() => {
//     const { data: authListener } = supabase.auth.onAuthStateChange(
//       async (_event, session) => {
//         setUser(session?.user ?? null)
//       }
//     )

//     supabase.auth.getSession().then(({ data }) => {
//       setUser(data.session?.user ?? null)
//     })

//     return () => {
//       authListener.subscription.unsubscribe()
//     }
//   }, [])

//   const loginWithEmail = async (email: string, password: string) => {
//     const { error } = await supabase.auth.signInWithPassword({ email, password })
//     if (error) throw error
//   }

//   const loginWithProvider = (provider: "google" | "azure") => {
//     supabase.auth.signInWithOAuth({
//       provider,
//       options: {
//         redirectTo: "http://localhost:5173/dashboard", // or your prod URL
//       },
//     })
//   }

//   const logout = async () => {
//     await supabase.auth.signOut()
//     setUser(null)
//   }

//   return (
//     <AuthContext.Provider value={{ user, loginWithEmail, loginWithProvider, logout }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export const useAuth = () => {
//   const context = useContext(AuthContext)
//   if (!context) throw new Error("useAuth must be used within AuthProvider")
//   return context
// }
