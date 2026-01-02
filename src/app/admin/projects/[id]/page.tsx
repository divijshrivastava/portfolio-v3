import ProjectForm from '@/components/admin/ProjectForm';
import { getProject } from '@/app/actions/project';
import { notFound } from 'next/navigation';

export default async function EditProjectPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const project = await getProject(params.id);

    if (!project) {
        notFound();
    }

    return <ProjectForm project={project} />;
}
