import { db } from "../server/db";
import { users, teams, teamMembers, socialPlatforms, posts, templates, activities } from "../shared/schema";

async function seedDatabase() {
  console.log("Starting database seeding...");

  // Create users
  const sampleUsers = [
    {
      username: "sarah.chen",
      password: "hashed_password_1",
      email: "sarah@company.com",
      name: "Sarah Chen",
      role: "admin",
      avatar: null,
      timezone: "America/New_York",
    },
    {
      username: "mike.rodriguez",
      password: "hashed_password_2",
      email: "mike@company.com",
      name: "Mike Rodriguez",
      role: "editor",
      avatar: null,
      timezone: "America/Los_Angeles",
    },
    {
      username: "emma.johnson",
      password: "hashed_password_3",
      email: "emma@company.com",
      name: "Emma Johnson",
      role: "viewer",
      avatar: null,
      timezone: "Europe/London",
    },
  ];

  const createdUsers = await db.insert(users).values(sampleUsers).returning();
  console.log(`Created ${createdUsers.length} users`);

  // Create team
  const sampleTeam = {
    name: "Marketing Team",
    description: "Social media marketing and content creation team",
    ownerId: createdUsers[0].id,
  };

  const [createdTeam] = await db.insert(teams).values(sampleTeam).returning();
  console.log("Created team:", createdTeam.name);

  // Add team members
  const teamMemberData = createdUsers.map((user, index) => ({
    teamId: createdTeam.id,
    userId: user.id,
    role: index === 0 ? "admin" : index === 1 ? "editor" : "member",
  }));

  await db.insert(teamMembers).values(teamMemberData);
  console.log(`Added ${teamMemberData.length} team members`);

  // Create social platforms
  const platforms = [
    { name: "twitter", displayName: "Twitter", icon: "fab fa-twitter" },
    { name: "facebook", displayName: "Facebook", icon: "fab fa-facebook" },
    { name: "linkedin", displayName: "LinkedIn", icon: "fab fa-linkedin" },
    { name: "instagram", displayName: "Instagram", icon: "fab fa-instagram" },
    { name: "tiktok", displayName: "TikTok", icon: "fab fa-tiktok" },
    { name: "pinterest", displayName: "Pinterest", icon: "fab fa-pinterest" },
  ];

  const socialPlatformData = platforms.map(platform => ({
    name: platform.name,
    displayName: platform.displayName,
    icon: platform.icon,
    userId: createdUsers[0].id,
    isConnected: true,
    credentials: {},
  }));

  await db.insert(socialPlatforms).values(socialPlatformData);
  console.log(`Created ${socialPlatformData.length} social platform connections`);

  // Create sample posts with multilingual content
  const now = new Date();
  const morning = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const evening = new Date(now.getTime() + 8 * 60 * 60 * 1000);

  const samplePosts = [
    {
      title: "New Product Launch Announcement",
      content: {
        en: "Excited to announce our latest product that will revolutionize remote work! 🚀 #RemoteWork #Innovation",
        es: "¡Emocionados de anunciar nuestro último producto que revolucionará el trabajo remoto! 🚀 #TrabajoRemoto #Innovación",
        "pt-BR": "Empolgados em anunciar nosso novo produto que vai revolucionar o trabalho remoto! 🚀 #TrabalhoRemoto #Inovação"
      },
      media: null,
      platforms: ["twitter", "linkedin"],
      authorId: createdUsers[1].id,
      teamId: createdTeam.id,
      status: "scheduled",
      scheduledAt: morning,
      publishedAt: null,
      approvalStatus: "approved",
      approverId: createdUsers[0].id,
      approvedAt: new Date(),
    },
    {
      title: "Weekly Tips: Remote Team Management",
      content: {
        en: "This week's tip focuses on maintaining team productivity while working distributed. 💼 #RemoteWork #TeamManagement",
        fr: "Le conseil de cette semaine se concentre sur le maintien de la productivité de l'équipe en travaillant de manière distribuée. 💼 #TravailDistance #GestionEquipe",
        de: "Der Tipp dieser Woche konzentriert sich darauf, die Teamproduktivität bei verteilter Arbeit aufrechtzuerhalten. 💼 #RemoteArbeit #TeamManagement",
        "pt-BR": "A dica desta semana foca em manter a produtividade da equipe trabalhando de forma distribuída. 💼 #TrabalhoRemoto #GestãoDeEquipe"
      },
      media: null,
      platforms: ["tiktok", "pinterest"],
      authorId: createdUsers[2].id,
      teamId: createdTeam.id,
      status: "scheduled",
      scheduledAt: evening,
      publishedAt: null,
      approvalStatus: "pending",
      approverId: null,
      approvedAt: null,
    },
  ];

  await db.insert(posts).values(samplePosts);
  console.log(`Created ${samplePosts.length} sample posts`);

  // Create sample templates
  const sampleTemplates = [
    {
      name: "Product Launch Announcement",
      description: "Template for announcing new product launches",
      content: {
        en: "🚀 Exciting news! We're launching [PRODUCT_NAME] - a game-changer for [INDUSTRY]. Get ready to revolutionize your workflow! #ProductLaunch #Innovation",
        es: "🚀 ¡Noticias emocionantes! Estamos lanzando [PRODUCT_NAME] - un cambio revolucionario para [INDUSTRY]. ¡Prepárate para revolucionar tu flujo de trabajo! #LanzamientoProducto #Innovación",
        "pt-BR": "🚀 Novidades empolgantes! Estamos lançando [PRODUCT_NAME] - uma revolução para [INDUSTRY]. Prepare-se para revolucionar seu fluxo de trabalho! #LançamentoProduto #Inovação"
      },
      category: "product",
      authorId: createdUsers[0].id,
      teamId: createdTeam.id,
      isPublic: true,
    },
    {
      name: "Weekly Team Update",
      description: "Template for sharing weekly team progress",
      content: {
        en: "📊 Weekly Update: Our team accomplished [ACHIEVEMENTS] this week. Next week we're focusing on [GOALS]. #TeamWork #Progress",
        fr: "📊 Mise à jour hebdomadaire : Notre équipe a accompli [ACHIEVEMENTS] cette semaine. La semaine prochaine, nous nous concentrons sur [GOALS]. #TravailEquipe #Progrès",
        "pt-BR": "📊 Atualização Semanal: Nossa equipe conquistou [ACHIEVEMENTS] esta semana. Na próxima semana vamos focar em [GOALS]. #TrabalhoEmEquipe #Progresso"
      },
      category: "social",
      authorId: createdUsers[1].id,
      teamId: createdTeam.id,
      isPublic: false,
    }
  ];

  await db.insert(templates).values(sampleTemplates);
  console.log(`Created ${sampleTemplates.length} sample templates`);

  // Create sample activities
  const sampleActivities = [
    {
      userId: createdUsers[1].id,
      teamId: createdTeam.id,
      type: "post_published",
      description: "Published post to Twitter and LinkedIn",
      metadata: { postId: 1, platforms: ["twitter", "linkedin"] },
    },
    {
      userId: createdUsers[0].id,
      teamId: createdTeam.id,
      type: "user_invited",
      description: "Invited Emma Johnson to the team",
      metadata: { invitedUserId: createdUsers[2].id },
    },
    {
      userId: createdUsers[2].id,
      teamId: createdTeam.id,
      type: "post_created",
      description: "Created new scheduled post",
      metadata: { postId: 2 },
    },
  ];

  await db.insert(activities).values(sampleActivities);
  console.log(`Created ${sampleActivities.length} sample activities`);

  console.log("Database seeding completed successfully!");
}

seedDatabase().catch(console.error);