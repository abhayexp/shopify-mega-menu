import {
  Form,
  FormLayout,
  Checkbox,
  TextField,
  Button,
  DropZone,
  Select,
  
  Thumbnail,
  Card,
} from '@shopify/polaris';
import {Stack} from '@shopify/polaris';
import {useState, useCallback} from 'react';


interface TreeNode {
  id: string;
  label: string;
  title: string;
  linkType: 'custom' | 'collection' | 'product' | 'page';
  linkValue: string;
  children: TreeNode[];
}

interface TreeEditorProps {
  tree: TreeNode[];
  setTree: React.Dispatch<React.SetStateAction<TreeNode[]>>;
  isCostomize: boolean;
  data: any
}



export default function AddCarouselSlides() {
  const [newsletter, setNewsletter] = useState(false);
  const [email, setEmail] = useState('');
  const [files, setFiles] = useState<File[]>([]);

    const [selected, setSelected] = useState<string>('option1');

  const handleSelectChange = useCallback((value: string) => {
    setSelected(value);
  }, []);

  const options = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
  ];


  const handleSubmit = useCallback(() => {
    setEmail('');
    setNewsletter(false);
    setFiles([]);
  }, []);

  const handleNewsLetterChange = useCallback(
    (value: boolean) => setNewsletter(value),
    [],
  );

  const handleUrlChange = useCallback((value: string) => setEmail(value), []);

  const handleDropZoneDrop = useCallback(
    (_dropFiles: File[], acceptedFiles: File[], _rejectedFiles: File[]) => {
      setFiles(acceptedFiles);
    },
    [],
  );

  return (
    <Form onSubmit={handleSubmit}>
      <FormLayout>

      {/*  category selector */}
      <Select
      label="Select Category"
      options={options}
      onChange={handleSelectChange}
      value={selected}
      placeholder="Select an option"
    />

        <TextField
          value={email}
          onChange={handleUrlChange}
          label="Handle Url"
          type="email"
          autoComplete="email"
          helpText={
            <span>
              Upload Images =
            </span>
          }
        />

        <DropZone accept="image/*" type="image" onDrop={handleDropZoneDrop}>
          <DropZone.FileUpload />
        </DropZone>

        {files.length > 0 && (
          <Card spacing="extraTight" wrap={false}>
            {files.map((file, index) => (
              <Thumbnail
                key={index}
                size="large"
                alt={file.name}
                source={window.URL.createObjectURL(file)}
              />
            ))}
          </Card>
        )}

        <Button submit>Submit</Button>
      </FormLayout>
    </Form>
  );
}
