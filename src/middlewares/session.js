/**
 * Session middleware
 */
export function sessionMiddleware() {
  return (ctx, next) => {
    ctx.session = ctx.session || {};
    return next();
  };
}

export default sessionMiddleware;