function getAcademicYear(date = new Date()) {
  const year = date.getFullYear();
  const startsThisYear = date.getMonth() >= 7;
  const startYear = startsThisYear ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

export async function GET(request) {
  const searchParams = new URL(request.url).searchParams;
  const code = searchParams
    .get('code')
    ?.trim()
    .toUpperCase();
  const year = searchParams.get('year')?.trim() || getAcademicYear();

  if (!code) {
    return Response.json({ error: 'Missing module code' }, { status: 400 });
  }

  const response = await fetch(
    `https://api.nusmods.com/v2/${year}/modules/${code}.json`,
    { next: { revalidate: 86400 } },
  );

  if (!response.ok) {
    return Response.json({ error: `${code} was not found` }, { status: 404 });
  }

  const module = await response.json();

  return Response.json({
    moduleCode: module.moduleCode,
    title: module.title,
    description: module.description,
    prerequisite: module.prerequisite || null,
    semesterData: (module.semesterData || []).map((item) => item.semester),
  });
}
