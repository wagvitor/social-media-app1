import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      dashboard: 'Dashboard',
      createContent: 'Create Content',
      schedule: 'Schedule',
      analytics: 'Analytics',
      contentLibrary: 'Content Library',
      team: 'Team',
      
      // Dashboard
      scheduledPosts: 'Scheduled Posts',
      publishedToday: 'Published Today',
      totalReach: 'Total Reach',
      teamMembers: 'Team Members',
      recentActivity: 'Recent Activity',
      todaysSchedule: "Today's Schedule",
      quickActions: 'Quick Actions',
      connectedPlatforms: 'Connected Platforms',
      teamPerformance: 'Team Performance',
      
      // Actions
      createPost: 'Create Post',
      bulkSchedule: 'Bulk Schedule',
      useTemplate: 'Use Template',
      viewAnalytics: 'View Analytics',
      addPlatform: 'Add Platform',
      viewAll: 'View All',
      
      // Post creation
      content: 'Content',
      media: 'Media',
      platforms: 'Platforms',
      preview: 'Preview',
      postNow: 'Post Now',
      saveAsDraft: 'Save as Draft',
      schedulePost: 'Schedule Post',
      requireApproval: 'Require approval before posting',
      
      // Status
      connected: 'Connected',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      draft: 'Draft',
      scheduled: 'Scheduled',
      published: 'Published',
      
      // Time
      hoursAgo: '{{count}} hours ago',
      minutesAgo: '{{count}} minutes ago',
      
      // Common
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    }
  },
  es: {
    translation: {
      // Navigation
      dashboard: 'Panel de Control',
      createContent: 'Crear Contenido',
      schedule: 'Programar',
      analytics: 'Analíticas',
      contentLibrary: 'Biblioteca de Contenido',
      team: 'Equipo',
      
      // Dashboard
      scheduledPosts: 'Publicaciones Programadas',
      publishedToday: 'Publicado Hoy',
      totalReach: 'Alcance Total',
      teamMembers: 'Miembros del Equipo',
      recentActivity: 'Actividad Reciente',
      todaysSchedule: 'Programación de Hoy',
      quickActions: 'Acciones Rápidas',
      connectedPlatforms: 'Plataformas Conectadas',
      teamPerformance: 'Rendimiento del Equipo',
      
      // Actions
      createPost: 'Crear Publicación',
      bulkSchedule: 'Programación Masiva',
      useTemplate: 'Usar Plantilla',
      viewAnalytics: 'Ver Analíticas',
      addPlatform: 'Agregar Plataforma',
      viewAll: 'Ver Todo',
      
      // Post creation
      content: 'Contenido',
      media: 'Medios',
      platforms: 'Plataformas',
      preview: 'Vista Previa',
      postNow: 'Publicar Ahora',
      saveAsDraft: 'Guardar como Borrador',
      schedulePost: 'Programar Publicación',
      requireApproval: 'Requerir aprobación antes de publicar',
      
      // Status
      connected: 'Conectado',
      pending: 'Pendiente',
      approved: 'Aprobado',
      rejected: 'Rechazado',
      draft: 'Borrador',
      scheduled: 'Programado',
      published: 'Publicado',
      
      // Time
      hoursAgo: 'hace {{count}} horas',
      minutesAgo: 'hace {{count}} minutos',
      
      // Common
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
    }
  },
  fr: {
    translation: {
      // Navigation
      dashboard: 'Tableau de Bord',
      createContent: 'Créer du Contenu',
      schedule: 'Programmer',
      analytics: 'Analyses',
      contentLibrary: 'Bibliothèque de Contenu',
      team: 'Équipe',
      
      // Dashboard
      scheduledPosts: 'Publications Programmées',
      publishedToday: "Publié Aujourd'hui",
      totalReach: 'Portée Totale',
      teamMembers: "Membres de l'Équipe",
      recentActivity: 'Activité Récente',
      todaysSchedule: "Programme d'Aujourd'hui",
      quickActions: 'Actions Rapides',
      connectedPlatforms: 'Plateformes Connectées',
      teamPerformance: "Performance de l'Équipe",
      
      // Actions
      createPost: 'Créer une Publication',
      bulkSchedule: 'Programmation en Masse',
      useTemplate: 'Utiliser un Modèle',
      viewAnalytics: 'Voir les Analyses',
      addPlatform: 'Ajouter une Plateforme',
      viewAll: 'Voir Tout',
      
      // Post creation
      content: 'Contenu',
      media: 'Médias',
      platforms: 'Plateformes',
      preview: 'Aperçu',
      postNow: 'Publier Maintenant',
      saveAsDraft: 'Sauvegarder comme Brouillon',
      schedulePost: 'Programmer la Publication',
      requireApproval: 'Exiger une approbation avant publication',
      
      // Status
      connected: 'Connecté',
      pending: 'En Attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      draft: 'Brouillon',
      scheduled: 'Programmé',
      published: 'Publié',
      
      // Time
      hoursAgo: 'il y a {{count}} heures',
      minutesAgo: 'il y a {{count}} minutes',
      
      // Common
      cancel: 'Annuler',
      save: 'Sauvegarder',
      delete: 'Supprimer',
      edit: 'Modifier',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
    }
  },
  de: {
    translation: {
      // Navigation
      dashboard: 'Dashboard',
      createContent: 'Inhalt Erstellen',
      schedule: 'Planen',
      analytics: 'Analytik',
      contentLibrary: 'Inhaltsbibliothek',
      team: 'Team',
      
      // Dashboard
      scheduledPosts: 'Geplante Beiträge',
      publishedToday: 'Heute Veröffentlicht',
      totalReach: 'Gesamtreichweite',
      teamMembers: 'Teammitglieder',
      recentActivity: 'Letzte Aktivität',
      todaysSchedule: 'Heutiger Zeitplan',
      quickActions: 'Schnellaktionen',
      connectedPlatforms: 'Verbundene Plattformen',
      teamPerformance: 'Team-Leistung',
      
      // Actions
      createPost: 'Beitrag Erstellen',
      bulkSchedule: 'Massenplanung',
      useTemplate: 'Vorlage Verwenden',
      viewAnalytics: 'Analytik Anzeigen',
      addPlatform: 'Plattform Hinzufügen',
      viewAll: 'Alle Anzeigen',
      
      // Post creation
      content: 'Inhalt',
      media: 'Medien',
      platforms: 'Plattformen',
      preview: 'Vorschau',
      postNow: 'Jetzt Posten',
      saveAsDraft: 'Als Entwurf Speichern',
      schedulePost: 'Beitrag Planen',
      requireApproval: 'Genehmigung vor Veröffentlichung erforderlich',
      
      // Status
      connected: 'Verbunden',
      pending: 'Ausstehend',
      approved: 'Genehmigt',
      rejected: 'Abgelehnt',
      draft: 'Entwurf',
      scheduled: 'Geplant',
      published: 'Veröffentlicht',
      
      // Time
      hoursAgo: 'vor {{count}} Stunden',
      minutesAgo: 'vor {{count}} Minuten',
      
      // Common
      cancel: 'Abbrechen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      loading: 'Laden...',
      error: 'Fehler',
      success: 'Erfolg',
    }
  },
  ja: {
    translation: {
      // Navigation
      dashboard: 'ダッシュボード',
      createContent: 'コンテンツ作成',
      schedule: 'スケジュール',
      analytics: 'アナリティクス',
      contentLibrary: 'コンテンツライブラリ',
      team: 'チーム',
      
      // Dashboard
      scheduledPosts: '予定された投稿',
      publishedToday: '今日公開',
      totalReach: '総リーチ',
      teamMembers: 'チームメンバー',
      recentActivity: '最近の活動',
      todaysSchedule: '今日のスケジュール',
      quickActions: 'クイックアクション',
      connectedPlatforms: '接続されたプラットフォーム',
      teamPerformance: 'チームパフォーマンス',
      
      // Actions
      createPost: '投稿作成',
      bulkSchedule: '一括スケジュール',
      useTemplate: 'テンプレート使用',
      viewAnalytics: 'アナリティクス表示',
      addPlatform: 'プラットフォーム追加',
      viewAll: 'すべて表示',
      
      // Post creation
      content: 'コンテンツ',
      media: 'メディア',
      platforms: 'プラットフォーム',
      preview: 'プレビュー',
      postNow: '今すぐ投稿',
      saveAsDraft: '下書き保存',
      schedulePost: '投稿をスケジュール',
      requireApproval: '投稿前に承認が必要',
      
      // Status
      connected: '接続済み',
      pending: '保留中',
      approved: '承認済み',
      rejected: '拒否',
      draft: '下書き',
      scheduled: 'スケジュール済み',
      published: '公開済み',
      
      // Time
      hoursAgo: '{{count}}時間前',
      minutesAgo: '{{count}}分前',
      
      // Common
      cancel: 'キャンセル',
      save: '保存',
      delete: '削除',
      edit: '編集',
      loading: '読み込み中...',
      error: 'エラー',
      success: '成功',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
