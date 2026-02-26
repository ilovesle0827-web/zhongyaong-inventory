// 角色常數定義
export const ROLES = {
  ADMIN:            'admin',
  PURCHASE_MANAGER: 'purchase_manager',
  SALES_MANAGER:    'sales_manager',
  SALES_STAFF:      'sales_staff',
}

// 角色顯示名稱
export const ROLE_LABELS = {
  [ROLES.ADMIN]:            '管理員',
  [ROLES.PURCHASE_MANAGER]: '進貨負責人',
  [ROLES.SALES_MANAGER]:    '銷貨負責人',
  [ROLES.SALES_STAFF]:      '業務人員',
}

// 角色對應的路徑白名單與功能旗標
export const ROLES_CONFIG = {
  [ROLES.ADMIN]: {
    label: '管理員',
    allowedPaths: ['/', '/inventory', '/purchases', '/sales', '/customers', '/users'],
    canAdd: true,
    canDelete: true,
    canManageUsers: true,
  },
  [ROLES.PURCHASE_MANAGER]: {
    label: '進貨負責人',
    allowedPaths: ['/', '/inventory', '/purchases'],
    canAdd: true,
    canDelete: false,
    canManageUsers: false,
  },
  [ROLES.SALES_MANAGER]: {
    label: '銷貨負責人',
    allowedPaths: ['/', '/inventory', '/sales', '/customers'],
    canAdd: true,
    canDelete: false,
    canManageUsers: false,
  },
  [ROLES.SALES_STAFF]: {
    label: '業務人員',
    allowedPaths: ['/', '/sales', '/customers'],
    canAdd: true,
    canDelete: false,
    canManageUsers: false,
  },
}

// 無權限時的預設跳轉路徑
export const DEFAULT_REDIRECT = '/'
