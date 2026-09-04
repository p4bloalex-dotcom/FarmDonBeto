const screens = new Map();

export const registerScreen = ({ category, controller, routePath = controller, title = 'Sin descripcion', icon = 'dot-circle', actions }) => {
  const key = `${category}.${controller}`;
  const normalizedActions = [...new Map(actions.map(action => {
    const normalized = typeof action === 'string' ? { key: action, name: action } : action;
    return [normalized.key, normalized];
  })).values()];

  const screen = {
    category,
    controller,
    routePath,
    title,
    icon,
    actions: normalizedActions.map(action => action.name),
    permissions: normalizedActions.reduce((acc, action) => ({
      ...acc,
      [action.key]: {
        category,
        controller,
        menuPath: routePath,
        actionKey: action.key,
        action: action.name,
        permissionName: `${controller}.${action.name}`
      }
    }), {})
  };

  screens.set(key, screen);
  return screen.permissions;
};

export const getRegisteredScreens = () => [...screens.values()];
