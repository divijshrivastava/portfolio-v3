import BlogForm from '@/components/admin/BlogForm';
import { getBlog } from '@/app/actions/blog';
import { notFound } from 'next/navigation';

export default async function EditBlogPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const blog = await getBlog(params.id);

    if (!blog) {
        notFound();
    }

    return <BlogForm post={blog} />;
}
