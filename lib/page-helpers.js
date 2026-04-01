import AppShell from "@/Components/layout/AppShell";
import { canViewRoute } from "@/lib/access";

async function loadSessionUser(req) {
  const authModule = await import("@/lib/auth");
  return authModule.getSessionUser(req);
}

export function AppShellPage({ user, children }) {
  return <AppShell user={user}>{children}</AppShell>;
}

export function resolveBaseUrl(req) {
  const proto = (req?.headers?.["x-forwarded-proto"] || "http").split(",")[0];
  const host = req?.headers?.host || "localhost:3000";
  return `${proto}://${host}`;
}

export async function ensureRouteAccess(context, routeKey) {
  const user = await loadSessionUser(context.req);
  if (!user) {
    return {
      redirect: {
        destination: `/login?redirect=${encodeURIComponent(context.resolvedUrl || "/")}`,
        permanent: false,
      },
    };
  }

  if (routeKey && !canViewRoute(user.role, routeKey)) {
    return {
      redirect: { destination: "/dashboard/executivo", permanent: false },
    };
  }

  return { user };
}

export async function requirePageAuth(contextOrReq, routeKey = null) {
  if (contextOrReq?.req && contextOrReq?.res) {
    const access = await ensureRouteAccess(contextOrReq, routeKey);
    if (access.redirect) return access;
    return { props: { user: access.user } };
  }

  const req = contextOrReq;
  const user = await loadSessionUser(req);
  if (!user) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  return { user };
}

export function withPageAuth(allowedRoles, loader) {
  return async function getServerSideProps(context) {
    const access = await ensureRouteAccess(context);
    if (access.redirect) return access;

    const user = access.user;
    if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return {
        redirect: { destination: "/dashboard/executivo", permanent: false },
      };
    }

    if (!loader) {
      return { props: { user } };
    }

    const result = await loader({ user, context });
    return {
      props: {
        user,
        ...(result?.props || {}),
      },
    };
  };
}

export async function withProtectedPage(context, routeKey) {
  const access = await ensureRouteAccess(context, routeKey);
  if (access.redirect) return access;
  return { props: { user: access.user } };
}

export async function requirePageAccess(context, routeKey, loader) {
  const access = await ensureRouteAccess(context, routeKey);
  if (access.redirect) return access;

  const result = (await loader?.({ req: context.req, res: context.res, user: access.user, context })) || {};
  return {
    props: {
      user: access.user,
      ...(result.props || {}),
    },
  };
}
